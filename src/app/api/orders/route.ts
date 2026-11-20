import { createClient } from "@/lib/supabase-server";

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CheckoutBody = {
  items: CheckoutItem[];
  customerName: string;
  phone: string;
  shippingAddress: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCheckoutBody(value: unknown): CheckoutBody | null {
  if (!isRecord(value) || !Array.isArray(value.items)) return null;
  if (value.items.length === 0 || value.items.length > 50) return null;

  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const items: CheckoutItem[] = [];

  for (const rawItem of value.items) {
    if (
      !isRecord(rawItem) ||
      typeof rawItem.productId !== "string" ||
      !uuidPattern.test(rawItem.productId) ||
      typeof rawItem.quantity !== "number" ||
      !Number.isSafeInteger(rawItem.quantity) ||
      rawItem.quantity < 1 ||
      rawItem.quantity > 2147483647
    ) {
      return null;
    }

    items.push({
      productId: rawItem.productId,
      quantity: rawItem.quantity,
    });
  }

  if (
    typeof value.customerName !== "string" ||
    value.customerName.trim().length === 0 ||
    value.customerName.trim().length > 200 ||
    typeof value.phone !== "string" ||
    value.phone.trim().length === 0 ||
    value.phone.trim().length > 40 ||
    typeof value.shippingAddress !== "string" ||
    value.shippingAddress.trim().length === 0 ||
    value.shippingAddress.trim().length > 1000
  ) {
    return null;
  }

  return {
    items,
    customerName: value.customerName.trim(),
    phone: value.phone.trim(),
    shippingAddress: value.shippingAddress.trim(),
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json(
      { error: "Connectez-vous pour passer commande.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const body = parseCheckoutBody(payload);
  if (!body) {
    return Response.json(
      { error: "Vérifiez les articles et les coordonnées de livraison." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_items: body.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_customer_name: body.customerName,
    p_phone: body.phone,
    p_shipping_address: body.shippingAddress,
  });

  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") {
      // place_order stored function not installed in Supabase yet; fallback to direct insertion
      const productIds = body.items.map((i) => i.productId);
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, price, stock, is_active")
        .in("id", productIds);

      if (productsError || !products) {
        return Response.json(
          { error: "Impossible de vérifier la disponibilité des ouvrages." },
          { status: 500 }
        );
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let computedTotal = 0;
      const itemsToInsert: {
        product_id: string;
        product_title: string;
        unit_price: number;
        quantity: number;
      }[] = [];

      for (const item of body.items) {
        const product = productMap.get(item.productId);
        if (!product || !product.is_active || product.stock < item.quantity) {
          return Response.json(
            {
              error:
                "Un livre n’est plus disponible ou le stock demandé a changé. Vérifiez votre panier.",
              code: "ORDER_REJECTED",
            },
            { status: 409 }
          );
        }
        const unitPrice = Number(product.price);
        computedTotal += unitPrice * item.quantity;
        itemsToInsert.push({
          product_id: product.id,
          product_title: product.title,
          unit_price: unitPrice,
          quantity: item.quantity,
        });
      }

      let orderRes = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          customer_name: body.customerName,
          phone: body.phone,
          address: body.shippingAddress,
          status: "pending",
          total: computedTotal,
        })
        .select("id")
        .single();

      if (orderRes.error && orderRes.error.message.includes("customer_id")) {
        orderRes = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            customer_name: body.customerName,
            phone: body.phone,
            shipping_address: body.shippingAddress,
            status: "pending",
            total: computedTotal,
          })
          .select("id")
          .single();
      }

      if (orderRes.error || !orderRes.data) {
        console.error("Échec de la commande directe :", orderRes.error?.message);
        return Response.json(
          { error: "La commande n'a pas pu être enregistrée." },
          { status: 500 }
        );
      }

      const createdOrderId = orderRes.data.id;
      const { error: itemsError } = await supabase.from("order_items").insert(
        itemsToInsert.map((item) => ({
          ...item,
          order_id: createdOrderId,
        }))
      );

      if (itemsError) {
        console.error("Échec de l'insertion des articles :", itemsError.message);
      }

      // Decrement stock for purchased items
      for (const item of body.items) {
        const prod = productMap.get(item.productId);
        if (prod) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, prod.stock - item.quantity) })
            .eq("id", item.productId);
        }
      }

      return Response.json({
        orderId: createdOrderId,
        total: computedTotal,
        paymentStatus: "unpaid",
      });
    }

    if (error.code === "22023") {
      const publicMessages: Record<string, string> = {
        "A product is unavailable or has insufficient stock":
          "Un livre n’est plus disponible ou le stock demandé a changé. Vérifiez votre panier.",
        "Valid customer name, phone, and shipping address are required":
          "Vérifiez votre nom, votre téléphone et votre adresse de livraison.",
        "The order must contain between 1 and 50 items":
          "Le panier doit contenir entre 1 et 50 lignes d’articles.",
        "Each order item must have a product and a positive quantity":
          "Chaque article doit avoir une quantité valide.",
      };
      return Response.json(
        {
          error:
            publicMessages[error.message] ||
            "La commande a été refusée. Vérifiez les informations saisies.",
          code: "ORDER_REJECTED",
        },
        { status: 409 }
      );
    }

    if (error.code === "42501") {
      return Response.json(
        { error: "Vous n'êtes pas autorisé à passer cette commande." },
        { status: 403 }
      );
    }

    console.error("La création de commande a échoué.", error.message);
    return Response.json(
      { error: "La commande n'a pas pu être enregistrée." },
      { status: 500 }
    );
  }

  if (
    !isRecord(data) ||
    typeof data.order_id !== "string" ||
    typeof data.total !== "number"
  ) {
    console.error("La fonction de commande a retourné une réponse invalide.");
    return Response.json(
      { error: "La commande a été reçue, mais sa confirmation a échoué." },
      { status: 500 }
    );
  }

  return Response.json({
    orderId: data.order_id,
    total: data.total,
    paymentStatus: "unpaid",
  });
}
