
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ==========================================
// CONFIGURATION SUPABASE ADMIN
// ==========================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Configuration Supabase manquante. Vérifie les variables d'environnement."
  );
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ==========================================
// API : CRÉATION D'UNE COMMANDE
// ==========================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      customerName,
      phone,
      shippingAddress,
      items,
    } = body;

    // Vérification des informations client
    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof shippingAddress !== "string" ||
      !shippingAddress.trim() ||
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > 50
    ) {
      return NextResponse.json(
        { error: "Informations de commande invalides." },
        { status: 400 }
      );
    }

    // Vérification des articles
    const validItems = items.map((item: any) => {
      if (
        !item ||
        typeof item.productId !== "string" ||
        typeof item.title !== "string" ||
        !item.title.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        !Number.isSafeInteger(item.price) ||
        item.price < 0
      ) {
        throw new Error("Un article de la commande est invalide.");
      }

      return {
        product_id: item.productId,
        product_title: item.title.trim(),
        quantity: item.quantity,
        unit_price: item.price,
      };
    });

    // Calcul du montant total
    const total = validItems.reduce(
      (sum, item) =>
        sum + item.quantity * item.unit_price,
      0
    );

    if (!Number.isSafeInteger(total) || total <= 0) {
      return NextResponse.json(
        { error: "Montant de commande invalide." },
        { status: 400 }
      );
    }

    // ==========================================
    // ENREGISTREMENT DE LA COMMANDE
    // ==========================================

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .insert({
          customer_id: null,
          customer_name: customerName.trim(),
          phone: phone.trim(),
          address: shippingAddress.trim(),
          total,
          status: "pending",
        })
        .select("id")
        .single();

    if (orderError || !order) {
      console.error(
        "Erreur création commande :",
        orderError
      );

      return NextResponse.json(
        { error: "Impossible d'enregistrer la commande." },
        { status: 500 }
      );
    }

    // ==========================================
    // ENREGISTREMENT DES ARTICLES
    // ==========================================

    const orderItems = validItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error(
        "Erreur articles commande :",
        itemsError
      );

      // Suppression de la commande incomplète
      const { error: deleteError } = await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (deleteError) {
        console.error(
          "Erreur suppression commande incomplète :",
          deleteError
        );
      }

      return NextResponse.json(
        { error: "Impossible d'enregistrer les articles." },
        { status: 500 }
      );
    }

    // ==========================================
    // SUCCÈS
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        total,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error(
      "Erreur API commandes :",
      error
    );

    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la commande.",
      },
      { status: 500 }
    );
  }
}
