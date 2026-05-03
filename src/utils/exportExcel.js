import { utils, writeFile } from 'xlsx';
import { getHistory } from './store';

export const exportHistoryToExcel = () => {
  const history = getHistory();
  
  if (!history || history.length === 0) {
    alert("No hay cotizaciones guardadas para exportar.");
    return;
  }

  // Mapear los datos complejos a un formato plano (filas y columnas)
  const flattenedData = history.map(item => {
    // Calculamos los totales en base al subtotal guardado o sumando los items si es necesario,
    // o calculamos inversamente desde el total si el subtotal es 0
    let total = item.totales?.total || 0;
    
    // Si no hay total guardado pero hay items, los calculamos
    if (total === 0 && item.items && item.items.length > 0) {
      total = item.items.reduce((acc, i) => acc + (i.cantidad * i.precioUnitario), 0);
    }

    const igv = total * 0.18;
    const subtotal = total - igv;

    return {
      'Número Cotización': item.cotizacion.numero,
      'Fecha Emisión': item.cotizacion.fechaEmision,
      'Fecha Vencimiento': item.cotizacion.fechaVencimiento,
      'Cliente': item.cliente.nombre,
      'DNI/RUC': item.cliente.ruc,
      'Teléfono': item.cliente.telefono,
      'Subtotal (S/)': Number(subtotal.toFixed(2)),
      'IGV (S/)': Number(igv.toFixed(2)),
      'Total (S/)': Number(total.toFixed(2)),
      'Fecha de Guardado': item.dateSaved ? new Date(item.dateSaved).toLocaleString('es-PE') : ''
    };
  });

  // Crear la hoja de trabajo y el libro
  const worksheet = utils.json_to_sheet(flattenedData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Cotizaciones");

  // Generar el archivo y forzar la descarga
  const fileName = `Respaldo_Cotizaciones_${new Date().toLocaleDateString('es-PE').replace(/\//g, '-')}.xlsx`;
  writeFile(workbook, fileName);
};