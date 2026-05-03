export const getNextCotizacionNumber = () => {
  if (typeof window === 'undefined') return "00000100";
  const current = localStorage.getItem('cotizacion_current_number');
  if (!current) {
    localStorage.setItem('cotizacion_current_number', "00000100");
    return "00000100";
  }
  return current;
};

export const incrementCotizacionNumber = () => {
  if (typeof window === 'undefined') return "00000100";
  const current = getNextCotizacionNumber();
  const next = (parseInt(current, 10) + 1).toString().padStart(8, '0');
  localStorage.setItem('cotizacion_current_number', next);
  return next;
};

export const getInitialData = () => ({
  empresa: {
    nombre: "VENTA DE TELAS, TAPASOLES, TULES EXCLUSIVOS PARA CORTINAS",
    servicios: [
      "CONFECCIONAMOS CORTINAS, ESTORES, ONDAS DRAPEADAS Y ROLLERS",
      "PERSIANAS VERTICALES, HORIZONTALES DE MADERA, PUERTA PLEGADIZA",
      "TAPICERIA, FABRICACION DE MUEBLES DE MELAMINE",
      "VIDRIOS TEMPLADOS PARA BAÑOS"
    ],
    direccion: "Jr. Gamarra 653 2do Sotano Tda. Galeria Plaza La Victoria",
    ruc: "10456789012"
  },
  cliente: {
    nombre: "",
    ruc: "",
    telefono: ""
  },
  cotizacion: {
    numero: getNextCotizacionNumber(),
    fechaEmision: new Date().toLocaleDateString('es-PE'),
    fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE')
  },
  items: [],
  totales: {
    subtotal: 0,
    igv: 0,
    total: 0,
    importeLetras: ""
  },
  banco: {
    cuentaBcp: "19124261433097",
    cci: "00219112426143309752"
  },
  asesor: {
    nombre: "Antonio Larrauri",
    celular: "995446540"
  }
});

export const saveCotizacion = (data) => {
  const history = getHistory();
  const index = history.findIndex(item => item.id === data.id);
  
  if (index >= 0) {
    history[index] = data;
  } else {
    history.push({
      ...data,
      id: Date.now().toString(),
      dateSaved: new Date().toISOString()
    });
  }
  
  localStorage.setItem('cotizaciones_history', JSON.stringify(history));
  return history;
};

export const getHistory = () => {
  const historyStr = localStorage.getItem('cotizaciones_history');
  return historyStr ? JSON.parse(historyStr) : [];
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(amount);
};
