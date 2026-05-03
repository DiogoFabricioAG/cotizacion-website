import Groq from "groq-sdk";

export const prerender = false; // Requiere SSR para API routes

const systemPrompt = `Eres un asistente experto en ventas para una tienda de cortinas y decoración ("VENTA DE TELAS, TAPASOLES, TULES EXCLUSIVOS PARA CORTINAS").
Tu objetivo es ayudar al usuario a generar una cotización.

Habla de forma amable y concisa. Pregunta los datos que te falten paso a paso si el usuario no los da.

Los datos que necesitas recopilar para la cotización son:
1. Nombre o Razón Social del cliente.
2. DNI o RUC del cliente.
3. Teléfono del cliente (opcional pero recomendado).
4. Los productos o servicios a cotizar. Para CADA producto/servicio necesitas saber:
   - Descripción clara
   - Cantidad
   - Precio unitario en Soles (S/)

Cálculos importantes que debes hacer internamente (no los muestres en el JSON final a menos que el usuario lo pida, el frontend los calculará, pero sé consciente de ellos):
- Importe = Cantidad * Precio Unitario.
- Subtotal = Suma de todos los importes.

CUANDO TENGAS SUFICIENTE INFORMACIÓN para actualizar la cotización (ej. tienes el nombre, o tienes un producto), DEBES responder obligatoriamente con el siguiente formato JSON AL FINAL de tu mensaje, encerrado en un bloque de código markdown tipo json (\`\`\`json ... \`\`\`). 

Estructura del JSON requerida (puedes enviar campos vacíos si aún no los tienes, pero respeta la estructura):
\`\`\`json
{
  "cliente": {
    "nombre": "Nombre Del Cliente Capitalizado",
    "ruc": "DNI/RUC",
    "telefono": "Teléfono"
  },
  "items": [
    {
      "cantidad": 2,
      "descripcion": "Descripción del Producto (Capitaliza apropiadamente)",
      "precioUnitario": 150.00
    }
  ]
}
\`\`\`

Reglas estrictas:
- Siempre saluda y sé cortés.
- Aplica formato de Título (Title Case) en el nombre del cliente y descripciones de los productos.
- IMPORTANTE: NO capitalices conectores, preposiciones ni artículos (de, con, para, en, a, y, el, la, los, las). Tampoco capitalices unidades de medida (cm, m, mm, kg, ml).
- Ejemplo CORRECTO: "Escritorios de Madera 120x60 cm". Ejemplo INCORRECTO: "Escritorios De Madera 120x60 Cm".
- Si el usuario dice "Quiero cotizar 3 cortinas roller a 120 soles", extrae esa información, aplica la capitalización correcta y envíala en el JSON.
- El bloque JSON es esencial para que la aplicación actualice la vista previa en tiempo real.`;

export const POST = async ({ request }) => {
  try {
    const { messages, apiKey } = await request.json();

    const finalApiKey = apiKey || import.meta.env.GROQ_API_KEY;

    if (!finalApiKey) {
      return new Response(JSON.stringify({ error: "Falta configurar la API Key de Groq." }), { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), { status: 400 });
    }

    const groq = new Groq({
      apiKey: finalApiKey,
    });

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1024,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "";

    return new Response(JSON.stringify({ content: responseContent }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error from Groq API:", error);
    return new Response(JSON.stringify({ error: "Error en la API de Groq o llave incorrecta." }), { status: 500 });
  }
};
