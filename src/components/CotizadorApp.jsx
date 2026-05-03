import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Save, History, Printer, Download, Settings, Key } from 'lucide-react';
import { getInitialData, saveCotizacion, getHistory, formatCurrency, incrementCotizacionNumber } from '../utils/store';
import { exportHistoryToExcel } from '../utils/exportExcel';
import '../styles/global.css';

const PreviewPanel = ({ data, componentRef }) => {
  if (!data) return null; // Avoid rendering until hydrated

  const { empresa, cliente, cotizacion, items, banco, asesor } = data;

  // Calcular totales
  const sumatoriaItems = items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  const total = sumatoriaItems;
  const igv = total * 0.18; 
  const subtotal = total - igv;

  return (
    <div className="bg-white p-8 border border-gray-200 shadow-sm max-w-[900px] mx-auto text-gray-900" ref={componentRef}>
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-300 pb-5 mb-8 gap-5 flex-wrap print:flex-nowrap">
        <div className="flex-1 min-w-[300px]">
          <div className="flex flex-col gap-2.5">
            <div className="w-full max-w-[350px] mb-2 font-bold text-2xl tracking-wider">
               <img src="/logo.png" alt="Logo" className="w-full h-auto block" />
            </div>
            <div className="text-sm leading-relaxed mb-2.5">
              <strong>“{empresa.nombre}”</strong>
              <div className="text-[10px] leading-tight mt-1 text-gray-600">
                {empresa.servicios.map((srv, i) => (
                  <React.Fragment key={i}>
                    {srv}<br />
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="max-w-[560px]">
              <p className="mb-1 text-sm"><strong>Dirección:</strong> {empresa.direccion}</p>
              <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded">
                <p className="mb-1 text-sm"><strong>Cliente:</strong> {cliente.nombre || '___________________________'}</p>
                <p className="mb-1 text-sm"><strong>DNI/RUC:</strong> {cliente.ruc || '________________'}</p>
                <p className="mb-1 text-sm"><strong>Teléfono:</strong> {cliente.telefono || '________________'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-[260px]">
          <div className="border border-gray-900 overflow-hidden">
            <div className="p-3 text-sm border-b border-gray-900">
              <strong className="block text-[13px] tracking-wider uppercase mb-1">RUC</strong>
              <div className="text-2xl font-bold leading-tight">{empresa.ruc}</div>
            </div>
            <div className="p-3 text-sm">
              <strong className="block text-[13px] tracking-wider uppercase mb-1">Cotización</strong>
              <div className="text-3xl font-bold leading-tight text-gray-900">N° {cotizacion.numero}</div>
            </div>
          </div>

          <div className="mt-3 border border-gray-900 overflow-hidden">
            <div className="p-3 text-sm border-b border-gray-900">
              <strong className="block text-[11px] tracking-wider uppercase mb-1 text-gray-600">Fecha de emisión</strong>
              {cotizacion.fechaEmision}
            </div>
            <div className="p-3 text-sm">
              <strong className="block text-[11px] tracking-wider uppercase mb-1 text-gray-600">Fecha de vencimiento</strong>
              {cotizacion.fechaVencimiento}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-3 text-left text-sm w-16">Cant.</th>
            <th className="border border-gray-300 p-3 text-left text-sm">Descripción</th>
            <th className="border border-gray-300 p-3 text-right text-sm w-32">P. Unit.</th>
            <th className="border border-gray-300 p-3 text-right text-sm w-32">Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} className="border border-gray-300 p-8 text-center text-gray-400 italic">
                Añade productos desde el chat para verlos aquí
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 p-3 text-left text-sm">{item.cantidad}</td>
                <td className="border border-gray-300 p-3 text-left text-sm">{item.descripcion}</td>
                <td className="border border-gray-300 p-3 text-right text-sm">{formatCurrency(item.precioUnitario)}</td>
                <td className="border border-gray-300 p-3 text-right text-sm font-medium">
                  {formatCurrency(item.cantidad * item.precioUnitario)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="w-[320px] ml-auto border border-gray-300 rounded overflow-hidden">
        <div className="flex justify-between p-3 border-b border-gray-300 text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between p-3 border-b border-gray-300 text-sm">
          <span className="text-gray-600">IGV</span>
          <span className="font-medium">{formatCurrency(igv)}</span>
        </div>
        <div className="flex justify-between p-3 bg-gray-50 font-bold text-lg text-gray-900 border-t border-gray-300">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Footer Details */}
      <div className="mt-8">
        <div className="border border-gray-300 bg-gray-50 p-3 flex justify-start items-center gap-3 text-sm rounded">
          <span className="font-bold">IMPORTE EN LETRAS:</span>
          <span className="uppercase text-gray-700">{data.totales?.importeLetras || "_________________________________"}</span>
        </div>

        <div className="mt-6 max-w-[620px] mx-auto grid gap-2 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-[180px_1fr] gap-2">
            <span className="font-bold text-gray-700">Cuenta bancaria BCP:</span>
            <span className="font-mono">{banco.cuentaBcp}</span>
          </div>
          <div className="grid grid-cols-[180px_1fr] gap-2">
            <span className="font-bold text-gray-700">CCI:</span>
            <span className="font-mono">{banco.cci}</span>
          </div>
          <div className="grid grid-cols-[180px_1fr] gap-2">
            <span className="font-bold text-gray-700">Asesor:</span>
            <span>{asesor.nombre} - {asesor.celular}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CotizadorApp() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu asistente para crear cotizaciones. ¿Para quién es la cotización y qué productos o servicios deseas incluir?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cotizacionData, setCotizacionData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [storedApiKey, setStoredApiKey] = useState('');
  const [historyList, setHistoryList] = useState([]);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslatedTotal, setLastTranslatedTotal] = useState(null);

  const messagesEndRef = useRef(null);
  const printRef = useRef(null);

  useEffect(() => {
    setCotizacionData(getInitialData());
    setHistoryList(getHistory());
    
    // Load API Key from local storage
    const savedKey = localStorage.getItem('groq_api_key_local');
    if (savedKey) {
      setStoredApiKey(savedKey);
      setApiKeyInput(savedKey);
    } else {
      setShowSettings(true); // Muestra settings automáticamente si no hay API key configurada
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('groq_api_key_local', apiKeyInput);
    setStoredApiKey(apiKeyInput);
    setShowSettings(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateTotal = (items) => {
    return items.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
  };

  const ensureImporteEnLetras = async (data) => {
    const total = calculateTotal(data.items);
    
    // Si no hay items o el total es 0, no hay nada que traducir
    if (total === 0) return data;
    
    // Si el total no ha cambiado y ya tenemos un importe en letras, retornamos igual
    if (total === lastTranslatedTotal && data.totales?.importeLetras) {
      return data;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          total,
          apiKey: storedApiKey 
        }),
      });

      if (!response.ok) throw new Error('Error al traducir');
      
      const { content } = await response.json();
      
      const newData = {
        ...data,
        totales: {
          ...data.totales,
          total: total,
          importeLetras: content
        }
      };
      
      setLastTranslatedTotal(total);
      setCotizacionData(newData);
      return newData;
    } catch (error) {
      console.error('Error traduciendo a letras:', error);
      return data;
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePrint = async () => {
    if (!cotizacionData) return;
    
    const preparedData = await ensureImporteEnLetras(cotizacionData);
    
    const originalTitle = document.title;
    document.title = `Cotizacion-${preparedData.cotizacion.numero}-${preparedData.cliente.nombre || 'Borrador'}-${preparedData.cotizacion.numero}`;
    
    // Pequeño timeout para asegurar que React haya renderizado el importe en letras
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 100);
  };

  const handleSave = async () => {
    if (!cotizacionData) return;
    if (!cotizacionData.cliente.nombre) {
      alert("Por favor, ingresa al menos el nombre del cliente para guardar la cotización.");
      return;
    }

    const preparedData = await ensureImporteEnLetras(cotizacionData);

    const isNew = !preparedData.id;
    let dataToSave = { ...preparedData };

    if (isNew) {
      // Increment global counter so the next draft gets a new number
      incrementCotizacionNumber();
    }

    const updatedHistory = saveCotizacion(dataToSave);
    setHistoryList(updatedHistory);
    
    // Set the id back to the state so consecutive saves just update the same record
    if (isNew) {
      const savedItem = updatedHistory.find(h => h.id === updatedHistory[updatedHistory.length - 1].id);
      setCotizacionData(prev => ({ ...prev, id: savedItem.id }));
    }

    alert("Cotización guardada en el historial.");
  };

  const startNew = () => {
    setCotizacionData(getInitialData());
    setMessages([{ role: 'assistant', content: '¡Hola! Soy tu asistente para crear cotizaciones. ¿Para quién es la nueva cotización?' }]);
    setShowHistory(false);
  };

  const loadFromHistory = (item) => {
    setCotizacionData(item);
    setShowHistory(false);
    setMessages([
      { role: 'assistant', content: `He cargado la cotización de ${item.cliente.nombre}. ¿Deseas hacer alguna modificación?` }
    ]);
  };

  const parseBotResponse = (content) => {
    // Buscar JSON en la respuesta
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    
    let displayContent = content;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const extractedData = JSON.parse(jsonMatch[1]);
        
        // Actualizar el estado de la cotización
        setCotizacionData(prev => {
          const newData = { ...prev };
          
          if (extractedData.cliente) {
            newData.cliente = {
              ...newData.cliente,
              ...(extractedData.cliente.nombre && { nombre: extractedData.cliente.nombre }),
              ...(extractedData.cliente.ruc && { ruc: extractedData.cliente.ruc }),
              ...(extractedData.cliente.telefono && { telefono: extractedData.cliente.telefono }),
            };
          }
          
          if (extractedData.items && Array.isArray(extractedData.items)) {
             // Si el bot envía items, reemplazamos o añadimos. Por simplicidad ahora, reemplazamos con lo que el bot entiende que es la lista actual.
             newData.items = extractedData.items;
          }
          
          return newData;
        });

        // Limpiar el JSON del mensaje que se muestra al usuario
        displayContent = content.replace(/```json\n[\s\S]*?\n```/, '').trim();
        
      } catch (e) {
        console.error("Error parsing JSON from bot response", e);
      }
    }
    
    return displayContent;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: inputMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          })),
          apiKey: storedApiKey
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      const displayContent = parseBotResponse(data.content);

      if (displayContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: displayContent }]);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al conectar con el servidor. Por favor intenta de nuevo.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Panel Izquierdo: Chat */}
      <div className="w-1/3 flex flex-col bg-white border-r shadow-lg z-10 print:hidden min-w-[320px]">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Bot className="text-blue-400" />
            <h1 className="font-semibold text-lg tracking-wide">Asistente Cotizador</h1>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => {
                setShowSettings(true);
                setShowHistory(false);
              }}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-300 hover:text-white"
              title="Configuración API"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => {
                setShowHistory(!showHistory);
                setShowSettings(false);
              }}
              className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}
              title="Historial"
            >
              <History size={20} />
            </button>
          </div>
        </div>

        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <History size={18}/> Historial Guardado
              </h2>
              <button 
                onClick={exportHistoryToExcel}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                title="Descargar base de datos completa"
              >
                <Download size={16} /> a Excel
              </button>
            </div>
            {historyList.length === 0 ? (
              <p className="text-gray-500 text-sm text-center mt-10">No hay cotizaciones guardadas.</p>
            ) : (
              <div className="space-y-3">
                {historyList.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:ring-1 hover:ring-blue-400 transition-all"
                  >
                    <div className="font-bold text-gray-800 truncate">{item.cliente.nombre || 'Sin nombre'}</div>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>{new Date(item.dateSaved).toLocaleDateString()}</span>
                      <span className="font-medium text-blue-600">{formatCurrency(item.totales?.total || 0)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                      <Bot size={18} className="text-blue-600" />
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                   <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                      <Bot size={18} className="text-blue-600" />
                    </div>
                  <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe aquí los detalles... (Shift + Enter para nueva línea)"
                  className="flex-1 p-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all resize-none overflow-y-auto"
                  rows={2}
                  disabled={isLoading || isTranslating}
                />
                <button 
                  type="submit" 
                  disabled={isLoading || isTranslating || !inputMessage.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Panel Derecho: Vista Previa */}
      <div className="flex-1 flex flex-col bg-gray-200 overflow-hidden relative print:w-full print:bg-white print:overflow-visible">
        <div className="absolute top-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-b flex justify-between items-center shadow-sm z-10 print:hidden">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <FileText size={20} className="text-blue-600"/> Vista Previa de Cotización
          </div>
          <div className="flex gap-2">
            {isTranslating && <span className="text-sm text-gray-500 self-center mr-2 animate-pulse">Calculando...</span>}
            <button 
              onClick={startNew}
              disabled={isTranslating}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Nueva
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <Save size={16} /> Guardar Local
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-sm hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <Printer size={16} /> Exportar PDF
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 pt-24 print:p-0">
          {cotizacionData ? <PreviewPanel data={cotizacionData} componentRef={printRef} /> : <div className="text-center mt-20 text-gray-500">Cargando datos...</div>}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Key className="text-blue-600" size={24} /> Configuración de API
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave de API de Groq
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="gsk_..."
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Tu clave de API se guarda <strong>únicamente en tu navegador</strong> (Local Storage). Nunca se envía a ningún servidor externo aparte de la propia API de Groq para generar las cotizaciones.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowSettings(false);
                  setApiKeyInput(storedApiKey); // revertir si cancela
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={!apiKeyInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Guardar y Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
