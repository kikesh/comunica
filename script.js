// --- ConverGT Application Script ---
// This file contains the entire React application, bundled into a single script.
// It uses JSX, which is transpiled in the browser by Babel Standalone.

// --- CONFIGURATION ---
// IMPORTANT: The API_KEY must be provided by the execution environment.
// For development, you can replace the empty string with your key, but do not commit it.
const API_KEY = process.env.API_KEY || "";


// --- TYPES (as JS Objects) ---
const View = {
  Dashboard: 'Dashboard',
  ActivityLog: 'ActivityLog',
  Analytics: 'Analytics',
  ExternalComms: 'ExternalComms',
  SocialMedia: 'SocialMedia',
  InternalComms: 'InternalComms',
  Resources: 'Resources',
};

const ActivityCategory = {
  InternalMeeting: 'Reunión Interna',
  ExternalCampaign: 'Campaña Externa',
  Training: 'Formación',
  SocialMedia: 'Redes Sociales',
  MediaContact: 'Contacto con Medios',
  MemberSupport: 'Atención a Afiliados',
};

const Secretaria = {
    Local: "Local",
    Central: "Central",
    Organizacion: "Organización",
    General: "General",
    Sociosanitarios: "Sociosanitarios",
    Postal: "Postal",
    Formacion: "Formación",
    Comunicacion: "Comunicación",
    EnsenanzaPrivada: "Enseñanza Privada",
    Educacion: "Educación",
    Sanidad: "Sanidad",
    Autonomica: "Autonómica",
    Usal: "Usal",
    SaludLaboral: "Salud Laboral"
};

// --- SERVICES ---
const callGemini = async (prompt) => {
    if (!API_KEY) {
        return Promise.resolve("Error: La clave de API de Gemini no está configurada. La función de análisis no está disponible.");
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
        }
        
        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
           return data.candidates[0].content.parts[0].text;
        } else if (data.candidates && data.candidates[0].finishReason) {
            return `Respuesta no generada. Razón: ${data.candidates[0].finishReason}. Intenta reformular tu pregunta.`;
        } else {
            console.warn("Gemini response is empty or in an unexpected format:", data);
            return "La IA no ha devuelto una respuesta válida. Es posible que el contenido se haya bloqueado.";
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return `Error al contactar el servicio de IA: ${error.message}. Asegúrate de que la clave de API sea válida.`;
    }
};

const analyzeActivitiesForPress = async (activities) => {
  if (activities.length === 0) {
    return "No hay actividades para analizar. Registre algunas primero.";
  }

  const formattedActivities = activities.map(act => 
    `- Título: ${act.title}\n` +
    `  Secretaría Responsable: ${act.secretaria}\n` +
    `  Categoría: ${act.category}\n` +
    `  Descripción: ${act.description}\n` +
    `  Etiquetas de Relevancia: ${act.relevanceTags.join(', ')}\n` +
    `  Observaciones: ${act.observations}`
  ).join('\n\n');

  const prompt = `
    Eres un experto en comunicación estratégica y relaciones públicas para una organización sindical. Tu misión es identificar oportunidades noticiosas en las actividades internas para proyectar una imagen pública fuerte y coherente.

    Analiza la siguiente lista de actividades registradas por diferentes secretarías del sindicato. Identifica las 2-3 actividades con mayor potencial para convertirse en una nota de prensa o una comunicación externa exitosa.

    Para cada oportunidad que identifiques, proporciona:
    1.  **Titular Sugerido:** Un titular atractivo y conciso para la prensa.
    2.  **Ángulo de la Noticia:** Una breve explicación de por qué es noticiable y cuál debería ser el enfoque principal (considerando la secretaría implicada).
    3.  **Público Objetivo:** A qué tipo de medios o audiencias se debería dirigir.

    Sé claro, directo y estratégico en tus recomendaciones. Formatea tu respuesta de manera legible.

    Aquí están las actividades:
    ---
    ${formattedActivities}
    ---
  `;

    return callGemini(prompt);
};

const generateSocialMediaPost = async (activity, platform) => {
    const platformInstructions = {
        Twitter: "Sé conciso (menos de 280 caracteres), directo y usa 2-3 hashtags relevantes.",
        Facebook: "Escribe un texto un poco más largo y emotivo, que invite a la discusión. Termina con una pregunta. Utiliza emojis para mejorar la legibilidad.",
        Instagram: "El foco es visual. Escribe un pie de foto atractivo y sugiere una idea para la imagen o vídeo. Usa 5-7 hashtags populares y relevantes.",
        TikTok: "Escribe un guion corto y dinámico para un vídeo de 15-30 segundos. Incluye acciones visuales, texto en pantalla y sugiere una canción en tendencia.",
        'WhatsApp/Telegram': "Redacta un mensaje claro y directo para ser difundido en grupos. Debe ser fácil de leer y reenviar. Incluye un llamado a la acción claro y emojis."
    };

    const instruction = platformInstructions[platform] || "Crea una publicación genérica para redes sociales.";

    const prompt = `
        Eres un community manager experto para un sindicato. Tu objetivo es adaptar la siguiente actividad en una publicación para ${platform}.

        **Instrucciones específicas para ${platform}:**
        ${instruction}

        **Actividad a adaptar:**
        - **Título:** ${activity.title}
        - **Secretaría Responsable:** ${activity.secretaria}
        - **Descripción:** ${activity.description}
        - **Observaciones/Resultados:** ${activity.observations}
        - **Etiquetas Clave:** ${activity.relevanceTags.join(', ')}

        Genera únicamente el texto para la publicación de ${platform}. No añadas introducciones ni comentarios adicionales.
    `;

    return callGemini(prompt);
};


// --- UI COMPONENTS ---

const Icon = ({ name, className = 'w-6 h-6' }) => {
  const icons = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3.75M3.75 3h16.5M3.75 3v1.5M16.5 3v1.5M12 16.5v-1.5M12 6.75v.007M12 3v1.5" />,
    activity: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />,
    analytics: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    resources: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
    comms: <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.022z" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.5 18.75l1.188-.648a2.25 2.25 0 011.423 1.423l.648 1.188z" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
    newspaper: <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 100-2.186m0 2.186c-.18.324-.283.696-.283 1.093s.103.77.283 1.093m0-2.186l-9.566-5.314" />,
    cycle: <path strokeLinecap="round" strokeLinejoin="round" d="M17 8H4m0 0L8 4m-4 4l4 4M7 16h13m0 0l-4-4m4 4l-4 4" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    'arrow-left': <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9z" />,
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || <path d="M12 12m-10 0a10 10 0 1020 0a10 10 0 10-20 0" />}
    </svg>
  );
};

const Sidebar = ({ currentView, setView, isOpen, onClose }) => {
  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: 'dashboard' },
    { view: View.ActivityLog, label: 'Registrar Actividad', icon: 'activity' },
    { view: View.Analytics, label: 'Análisis y Métricas', icon: 'analytics' },
    { view: View.ExternalComms, label: 'Comunicación Externa', icon: 'newspaper' },
    { view: View.SocialMedia, label: 'Redes Sociales (IA)', icon: 'share' },
    { view: View.InternalComms, label: 'Comunicación Interna', icon: 'comms' },
    { view: View.Resources, label: 'Recursos y Guías', icon: 'resources' },
  ];

  const handleItemClick = (view) => {
    setView(view);
    onClose();
  };
  
  return (
    <React.Fragment>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      
      <aside
        className={`fixed lg:static top-0 left-0 h-full w-64 flex-shrink-0 bg-gray-800 p-4 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col items-center justify-center pt-2 mb-8">
          <div className="relative bg-red-600 w-[72px] h-[60px] rounded-lg flex items-center justify-center mb-4 shadow-lg">
              <Icon name="cycle" className="w-10 h-10 text-white"/>
              <div className="speech-bubble-pointer"></div>
          </div>
          <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-100">
                  Conver<span className="text-red-500">GT</span>
              </h1>
              <p className="text-sm font-medium text-red-500 -mt-1 tracking-tight">
                  Comunicación sindical en red
              </p>
          </div>
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleItemClick(item.view)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentView === item.view
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4 bg-gray-900 rounded-lg text-center">
          <h3 className="font-bold text-white">Cohesión para la Acción</h3>
          <p className="text-xs text-gray-400 mt-2">
            Esta herramienta potencia nuestra comunicación para fortalecer la lucha sindical.
          </p>
        </div>
      </aside>
    </React.Fragment>
  );
};

const DashboardView = ({ activities }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState('');
  const [error, setError] = React.useState('');

  const handleAnalysis = React.useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAnalysisResult('');
    try {
      const result = await analyzeActivitiesForPress(activities);
      setAnalysisResult(result);
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [activities]);

  const recentActivities = [...activities].slice(0, 5);

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Icon name="sparkles" className="w-6 h-6 mr-3 text-red-400" />
              Análisis de Oportunidades (IA)
            </h2>
            <p className="text-gray-400 mb-4">
              Usa la IA de Gemini para analizar las actividades registradas e identificar potenciales noticias para la prensa.
            </p>
            <button
              onClick={handleAnalysis}
              disabled={isLoading || activities.length === 0}
              className="flex items-center justify-center w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analizando...
                </>
              ) : "Analizar para Oportunidades de Prensa"}
            </button>
            {activities.length === 0 && <p className="text-sm text-yellow-400 mt-3">No hay actividades para analizar. ¡Registra una primero!</p>}

            {analysisResult && (
              <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h3 className="font-bold text-red-400 mb-2">Sugerencias de la IA:</h3>
                <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">{analysisResult}</pre>
              </div>
            )}
            {error && (
              <div className="mt-6 p-4 bg-red-900 border border-red-700 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h2>
            {recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {recentActivities.map(act => (
                  <li key={act.id} className="p-4 bg-gray-700 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h3 className="font-semibold text-white">{act.title}</h3>
                      <p className="text-sm text-gray-400">{act.category} / <span className="font-medium text-gray-300">{act.secretaria}</span></p>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 sm:mt-0">{new Date(act.date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No se han registrado actividades recientemente.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Resumen General</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-red-400">{activities.length}</p>
              <p className="text-gray-300">Actividades Totales Registradas</p>
            </div>
             <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-red-400">5</p>
              <p className="text-gray-300">Comunicados Enviados</p>
            </div>
             <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-3xl font-bold text-red-400">12</p>
              <p className="text-gray-300">Campañas Activas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityLogView = ({ activities, addActivity, updateActivity, deleteActivity, actingSecretaria }) => {
  const emptyFormState = {
    title: '',
    category: ActivityCategory.InternalMeeting,
    description: '',
    relevanceTags: '',
    observations: '',
  };
  const [formState, setFormState] = React.useState(emptyFormState);
  const [secretaria, setSecretaria] = React.useState(actingSecretaria);
  const [editingId, setEditingId] = React.useState(null);
  const [showSuccess, setShowSuccess] = React.useState('');

  React.useEffect(() => {
    if (!editingId) {
        setSecretaria(actingSecretaria);
    }
  }, [actingSecretaria, editingId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'secretaria') {
        setSecretaria(value);
    } else {
        setFormState(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleEditClick = (activity) => {
    setEditingId(activity.id);
    setFormState({
        title: activity.title,
        category: activity.category,
        description: activity.description,
        relevanceTags: activity.relevanceTags.join(', '),
        observations: activity.observations,
    });
    setSecretaria(activity.secretaria);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad? Esta acción no se puede deshacer.')) {
        deleteActivity(id);
        setShowSuccess('Actividad eliminada correctamente.');
        setTimeout(() => setShowSuccess(''), 3000);
    }
  };
  
  const resetForm = () => {
    setEditingId(null);
    setFormState(emptyFormState);
    setSecretaria(actingSecretaria);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.title || !formState.description || !secretaria) {
      alert('Por favor, complete todos los campos obligatorios: título, secretaría y descripción.');
      return;
    }

    const activityData = {
        ...formState,
        secretaria,
        relevanceTags: formState.relevanceTags.split(',').map(tag => tag.trim()).filter(Boolean),
    };

    if (editingId) {
        updateActivity({ ...activityData, id: editingId, date: activities.find(a => a.id === editingId)?.date || new Date().toISOString() });
        setShowSuccess('Actividad actualizada con éxito.');
    } else {
        addActivity(activityData);
        setShowSuccess('Actividad registrada con éxito.');
    }
    
    resetForm();
    setTimeout(() => setShowSuccess(''), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {showSuccess && (
        <div className="bg-green-800 border-l-4 border-green-400 text-green-100 p-4 mb-6 rounded-r-lg" role="alert">
          <p className="font-bold">{showSuccess}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{editingId ? 'Editando Actividad' : 'Registrar Nueva Actividad'}</h2>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Título de la Actividad</label>
          <input type="text" id="title" name="title" value={formState.title} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ej: Reunión de planificación campaña 'Salario Justo'" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="secretaria" className="block text-sm font-medium text-gray-300 mb-2">Secretaría Responsable</label>
            <select id="secretaria" name="secretaria" value={secretaria} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required>
              {Object.values(Secretaria).map((sec) => (<option key={sec} value={sec}>{sec}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <select id="category" name="category" value={formState.category} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
              {Object.values(ActivityCategory).map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Descripción Breve</label>
          <textarea id="description" name="description" value={formState.description} onChange={handleInputChange} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="¿Qué se hizo? ¿Cuál fue el objetivo?" required></textarea>
        </div>

        <div>
          <label htmlFor="relevanceTags" className="block text-sm font-medium text-gray-300 mb-2">Etiquetas de Relevancia (separadas por comas)</label>
          <input type="text" id="relevanceTags" name="relevanceTags" value={formState.relevanceTags} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="potencial para prensa, comunicación interna clave, sensibilización" />
        </div>
        
        <div>
          <label htmlFor="observations" className="block text-sm font-medium text-gray-300 mb-2">Resultados y Observaciones</label>
          <textarea id="observations" name="observations" value={formState.observations} onChange={handleInputChange} rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="¿Qué impacto tuvo? ¿Hay alguna sugerencia o necesidad detectada?"></textarea>
        </div>

        <div className="flex justify-end space-x-4">
          {editingId && <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">Cancelar Edición</button>}
          <button type="submit" className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">
            {editingId ? 'Actualizar Actividad' : 'Registrar Actividad'}
          </button>
        </div>
      </form>
      
      <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Historial de Actividades</h2>
        <div className="space-y-4">
            {activities.length > 0 ? activities.map(act => (
                <div key={act.id} className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
                    <div className="flex-1 mb-4 md:mb-0">
                        <p className="text-xs text-red-400 font-bold">{act.secretaria}</p>
                        <h3 className="font-semibold text-lg text-white">{act.title}</h3>
                        <p className="text-sm text-gray-300">{act.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                           {new Date(act.date).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })} - {act.category}
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex space-x-2">
                        <button onClick={() => handleEditClick(act)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-full transition-colors" aria-label="Editar">
                            <Icon name="edit" className="w-5 h-5"/>
                        </button>
                        <button onClick={() => handleDeleteClick(act.id)} className="p-2 text-gray-300 hover:text-white hover:bg-red-800 rounded-full transition-colors" aria-label="Eliminar">
                            <Icon name="trash" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            )) : <p className="text-gray-400">No hay actividades registradas.</p>}
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = ({ activities }) => {
  const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const categoryData = Object.values(ActivityCategory).map(category => ({
    name: category,
    actividades: activities.filter(act => act.category === category).length,
  }));

  const secretariaData = Object.values(Secretaria).map(secretaria => ({
    name: secretaria,
    actividades: activities.filter(act => act.secretaria === secretaria).length,
  })).sort((a, b) => b.actividades - a.actividades);

  return (
    <div className="p-4 md:p-8">
      <div className="space-y-8">
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">Actividades por Categoría</h2>
          {activities.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 0, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} angle={-45} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} tick={{ fill: '#a0aec0' }} />
                  <Tooltip cursor={{fill: 'rgba(239, 68, 68, 0.1)'}}/>
                  <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '20px' }} />
                  <Bar dataKey="actividades" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : ( <p className="text-center text-gray-400 py-16">No hay suficientes datos para generar gráficos.</p> )}
        </div>
        <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">Actividades por Secretaría</h2>
          {activities.length > 0 ? (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart data={secretariaData} margin={{ top: 5, right: 20, left: 0, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                  <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} angle={-45} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} tick={{ fill: '#a0aec0' }} />
                  <Tooltip cursor={{fill: 'rgba(239, 68, 68, 0.1)'}}/>
                  <Legend wrapperStyle={{ color: '#d1d5db', paddingTop: '20px' }} />
                  <Bar dataKey="actividades" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : ( <p className="text-center text-gray-400 py-16">No hay datos de secretarías.</p> )}
        </div>
      </div>
    </div>
  );
};

const ResourcesView = () => {
  const Card = ({ title, children, iconName }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Icon name={iconName} className="w-6 h-6 mr-3 text-red-400" />
        {title}
      </h2>
      <div className="text-gray-300 space-y-2">{children}</div>
    </div>
  );
  return (
    <div className="p-4 md:p-8">
      <div className="space-y-6">
        <Card title="Guía de Estilo y Lenguaje" iconName="resources">
          <p>Directrices para asegurar una comunicación coherente, inclusiva y profesional en todos nuestros canales.</p>
          <a href="https://drive.google.com/file/d/13n8KNxUKKU8FCPvLCLRKNgIj-Qic4FIX/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-semibold">Descargar guía completa (PDF) &rarr;</a>
        </Card>
        <Card title="Manual de Redes Sociales" iconName="share">
           <p>Buenas prácticas para la gestión de las redes sociales del sindicato, asegurando un mensaje alineado con nuestros objetivos.</p>
           <a href="https://drive.google.com/file/d/1bpXcs5J3U3G8W9Aj7mtUmMvYjQ7xlYGi/view?usp=drive_link" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-semibold mt-4 inline-block">Consultar manual de redes (PDF) &rarr;</a>
        </Card>
        <Card title="Protocolo de Crisis de Reputación" iconName="activity">
          <p>Pautas claras para actuar ante situaciones de crisis de imagen, protegiendo la reputación del sindicato.</p>
          <a href="#" className="text-red-400 hover:text-red-300 font-semibold">Ver protocolo detallado &rarr;</a>
        </Card>
      </div>
    </div>
  );
};

const InternalCommsView = ({ actingSecretaria }) => {
    const { useState, useMemo, useRef, useEffect } = React;
    const initialChannels = [
        { id: '1', name: '#anuncios-generales', description: 'Comunicados y directrices oficiales.', icon: 'comms' },
        { id: '2', name: '#proyecto-congreso24', description: 'Organización del próximo congreso.', icon: 'dashboard' },
    ];
    const initialMessages = {
        '1': [{ id: 'm1-1', text: 'Recordatorio: La próxima asamblea general será el viernes a las 18:00h.', author: Secretaria.General, timestamp: '10:30' }],
        '2': [{ id: 'm2-1', text: '¿Tenemos ya la lista definitiva de ponentes?', author: Secretaria.Organizacion, timestamp: '09:15' }],
    };
    const [channels, setChannels] = useState(initialChannels);
    const [messages, setMessages] = useState(initialMessages);
    const [activeChannelId, setActiveChannelId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChannel, setEditingChannel] = useState(null);

    useEffect(() => {
        if(window.innerWidth >= 1024 && !activeChannelId && channels.length > 0) {
            setActiveChannelId(channels[0].id);
        } else if (channels.length === 0) {
            setActiveChannelId(null);
        }
    }, [channels, activeChannelId]);

    const handleSaveChannel = (channelData) => {
        if (channelData.id) {
            setChannels(prev => prev.map(c => c.id === channelData.id ? { ...c, ...channelData } : c));
        } else {
            const newChannel = { ...channelData, id: new Date().toISOString() };
            setChannels(prev => [...prev, newChannel]);
            setMessages(prev => ({ ...prev, [newChannel.id]: [] }));
            setActiveChannelId(newChannel.id);
        }
    };

    const handleDeleteChannel = (channelId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este canal? Todos los mensajes se perderán.')) {
            setChannels(prev => prev.filter(c => c.id !== channelId));
            setMessages(prev => {
                const newMessages = { ...prev };
                delete newMessages[channelId];
                return newMessages;
            });
            if (activeChannelId === channelId) {
                setActiveChannelId(channels.length > 1 ? channels.find(c => c.id !== channelId).id : null);
            }
        }
    };

    const ChannelList = () => (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col h-full">
        <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-xl font-semibold text-white">Canales</h2>
            <button onClick={() => { setEditingChannel(null); setIsModalOpen(true); }} className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            </button>
        </div>
        <nav className="flex flex-col space-y-1 overflow-y-auto">
            {channels.map(channel => (
                <div key={channel.id} className="group relative">
                    <button onClick={() => setActiveChannelId(channel.id)} className={`flex items-center w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 ${activeChannelId === channel.id ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                       <Icon name={channel.icon} className="w-5 h-5 mr-3 flex-shrink-0" />
                       <span className="truncate">{channel.name}</span>
                    </button>
                    <div className="absolute top-1/2 right-2 -translate-y-1/2 hidden group-hover:flex items-center bg-gray-700 rounded-full">
                        <button onClick={() => { setEditingChannel(channel); setIsModalOpen(true); }} className="p-1.5 text-gray-300 hover:text-white"><Icon name="edit" className="w-4 h-4"/></button>
                        <button onClick={() => handleDeleteChannel(channel.id)} className="p-1.5 text-gray-300 hover:text-white"><Icon name="trash" className="w-4 h-4"/></button>
                    </div>
                </div>
            ))}
        </nav>
      </div>
    );
    
    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <ChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveChannel} channel={editingChannel} />
            <div className="lg:hidden">
                {!activeChannelId && <h1 className="text-2xl font-bold text-white mb-4">Comunicación Interna</h1>}
            </div>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
                <div className={`lg:hidden ${activeChannelId ? 'hidden' : 'block'} h-full`}><ChannelList /></div>
                <div className={`lg:hidden ${activeChannelId ? 'block' : 'hidden'} h-full`}><ChatArea activeChannelId={activeChannelId} channels={channels} messages={messages} setMessages={setMessages} actingSecretaria={actingSecretaria} setActiveChannelId={setActiveChannelId}/></div>
                <div className="hidden lg:block h-full"><ChannelList /></div>
                <div className="hidden lg:col-span-3 lg:block h-full"><ChatArea activeChannelId={activeChannelId} channels={channels} messages={messages} setMessages={setMessages} actingSecretaria={actingSecretaria} setActiveChannelId={setActiveChannelId}/></div>
            </div>
        </div>
    );
};

const ChatArea = ({activeChannelId, channels, messages, setMessages, actingSecretaria, setActiveChannelId}) => {
    const { useState, useMemo, useRef, useEffect } = React;
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const selectedChannel = useMemo(() => channels.find(c => c.id === activeChannelId), [channels, activeChannelId]);
    const channelMessages = useMemo(() => activeChannelId ? messages[activeChannelId] || [] : [], [messages, activeChannelId]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [channelMessages]);
    
    const submitMessage = () => {
        if (newMessage.trim() === '' || !activeChannelId) return;
        const message = {
            id: new Date().toISOString(),
            text: newMessage.trim(),
            author: actingSecretaria,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => ({ ...prev, [activeChannelId]: [...(prev[activeChannelId] || []), message] }));
        setNewMessage('');
    };

    const handleFormSubmit = (e) => { e.preventDefault(); submitMessage(); };
    const handleTextareaKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitMessage(); } };
    
    return (
         <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col h-full">
            {selectedChannel ? (
                <>
                    <div className="p-4 border-b border-gray-700 flex items-center">
                        <button onClick={() => setActiveChannelId(null)} className="lg:hidden mr-4 text-gray-400 hover:text-white"><Icon name="arrow-left" className="w-6 h-6" /></button>
                        <div>
                            <h3 className="font-bold text-white">{selectedChannel.name}</h3>
                            <p className="text-sm text-gray-400">{selectedChannel.description}</p>
                        </div>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {channelMessages.map(msg => {
                            const isOwnMessage = msg.author === actingSecretaria;
                            return (
                            <div key={msg.id} className={`flex items-end gap-3 ${isOwnMessage ? 'justify-end' : ''}`}>
                                <div className={`flex flex-col max-w-lg ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2 rounded-xl ${isOwnMessage ? 'bg-red-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        {!isOwnMessage && <span className="font-semibold">{msg.author}</span>}
                                        {isOwnMessage && <span className="font-semibold">Tú</span>}
                                        {' • '}
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                            )}
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-gray-700">
                        <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
                            <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder={`Enviar un mensaje a ${selectedChannel.name}`} className="flex-1 bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" rows={1} />
                            <button type="submit" className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 disabled:bg-gray-600" disabled={!newMessage.trim()}><Icon name="send" className="w-5 h-5"/></button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center h-full text-center p-4">
                    <p className="text-gray-500">{channels.length > 0 ? "Selecciona un canal para empezar a chatear." : "No hay canales. ¡Crea uno para empezar!"}</p>
                </div>
            )}
        </div>
    );
};

const ChannelModal = ({ isOpen, onClose, onSave, channel }) => {
    const { useState, useEffect } = React;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('comms');
    const availableIcons = ['comms', 'dashboard', 'analytics', 'resources', 'newspaper', 'share', 'sparkles', 'activity', 'users'];

    useEffect(() => {
        if (channel) {
            setName(channel.name);
            setDescription(channel.description);
            setIcon(channel.icon);
        } else {
            setName('');
            setDescription('');
            setIcon('comms');
        }
    }, [channel, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...channel, name, description, icon });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                <h2 className="text-xl font-bold text-white mb-4">{channel ? 'Editar Canal' : 'Crear Nuevo Canal'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input id="channel-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="#nombre-del-canal" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    <input id="channel-desc" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Propósito del canal" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    <select id="channel-icon" value={icon} onChange={e => setIcon(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                       {availableIcons.map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                    </select>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500">{channel ? 'Guardar Cambios' : 'Crear Canal'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ExternalCommsView = ({ actingSecretaria }) => {
    const { useState, useRef, useEffect } = React;
    const initialContacts = [
        { id: 'j1', name: 'Ana García', media: 'El País', phone: '600111222', email: 'agarcia@elpais.es' },
        { id: 'j2', name: 'Carlos Sánchez', media: 'Cadena SER', phone: '600333444', email: 'csanchez@cadenaser.es' },
        { id: 'j3', name: 'Laura Martinez', media: 'eldiario.es', phone: '600555666', email: 'lmartinez@eldiario.es' },
    ];
    
    const PressReleaseCreator = ({ actingSecretaria }) => {
        const [secretaria, setSecretaria] = useState(actingSecretaria);
        const [preheadline, setPreheadline] = useState('');
        const [headline, setHeadline] = useState('');
        const [subheadline, setSubheadline] = useState('');
        const [lead, setLead] = useState('');
        const [body, setBody] = useState('');
        const [contact, setContact] = useState('');
        const [isGenerating, setIsGenerating] = useState(false);
        const printRef = useRef(null);

        useEffect(() => { setSecretaria(actingSecretaria); }, [actingSecretaria]);

        const handleGeneratePdf = async () => {
            if (!printRef.current) return;
            setIsGenerating(true);
            try {
                const canvas = await window.html2canvas(printRef.current, { scale: 2, backgroundColor: '#ffffff' });
                const data = canvas.toDataURL('image/png');
                const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = (pdfWidth - 20) / imgWidth;
                pdf.addImage(data, 'PNG', 10, 10, imgWidth * ratio, imgHeight * ratio);
                pdf.save('comunicado-de-prensa.pdf');
            } catch(error) {
                console.error("Error generating PDF:", error);
                alert("Hubo un error al generar el PDF.");
            } finally {
                setIsGenerating(false);
            }
        };
        const isFormEmpty = !headline || !lead || !body || !contact;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                  <form className="space-y-6">
                     <select value={secretaria} onChange={(e) => setSecretaria(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required>
                         {Object.values(Secretaria).map((sec) => ( <option key={sec} value={sec}>{sec}</option> ))}
                     </select>
                      <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Titular Principal (requerido)" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      <textarea value={lead} onChange={e => setLead(e.target.value)} placeholder="Entradilla (lead) (requerido)" rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Cuerpo del Comunicado (requerido)" rows={8} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      <textarea value={contact} onChange={e => setContact(e.target.value)} placeholder="Información de Contacto (requerido)" rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500" required />
                      <button type="button" onClick={handleGeneratePdf} disabled={isFormEmpty || isGenerating} className="w-full flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors disabled:bg-gray-600"><Icon name="newspaper" className="w-5 h-5 mr-2"/>{isGenerating ? 'Generando PDF...' : 'Generar y Descargar PDF'}</button>
                  </form>
              </div>
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-4">Vista Previa</h2>
                  <div className="bg-white text-black p-6 rounded-md min-h-[500px] overflow-y-auto">
                      <div ref={printRef} className="prose max-w-none p-4 font-serif">
                         <p className="text-sm font-bold text-red-700">{secretaria}</p>
                         <h1 className="text-3xl font-bold mt-1 mb-2 text-gray-900">{headline || 'Titular del Comunicado'}</h1>
                         <p className="lead font-semibold text-gray-800 my-4 border-l-4 border-gray-300 pl-4">{lead || 'Este es el párrafo de la entradilla (lead)...'}</p>
                         <div className="mt-6 whitespace-pre-wrap text-justify text-gray-800">{body || 'Aquí se desarrolla el cuerpo completo del comunicado...'}</div>
                         <hr className="my-6"/><div className="mt-6 text-sm"><h3 className="font-bold mb-2 text-gray-900">Para más información:</h3><p className="whitespace-pre-wrap text-gray-800">{contact || 'Nombre Apellido\nCargo\nemail@sindicato.org'}</p></div>
                         <p className="text-center font-bold text-2xl mt-8 text-gray-500">###</p>
                      </div>
                  </div>
              </div>
          </div>
        );
    };

    const ContactAgenda = () => {
        const [contacts, setContacts] = useState(initialContacts);
        const [formState, setFormState] = useState({ name: '', media: '', phone: '', email: '' });
        const [editingId, setEditingId] = useState(null);

        const handleInputChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
        
        const resetForm = () => {
            setEditingId(null);
            setFormState({ name: '', media: '', phone: '', email: '' });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formState.name || !formState.media || !formState.email) {
                alert('Nombre, medio y email son obligatorios.');
                return;
            }

            if (editingId) {
                setContacts(contacts.map(c => c.id === editingId ? { ...formState, id: editingId } : c));
            } else {
                setContacts([{ ...formState, id: new Date().toISOString() }, ...contacts]);
            }
            resetForm();
        };

        const handleEditClick = (contact) => {
            setEditingId(contact.id);
            setFormState({ name: contact.name, media: contact.media, phone: contact.phone, email: contact.email });
        };

        const handleDeleteClick = (id) => {
            if (window.confirm('¿Eliminar este contacto?')) {
                setContacts(contacts.filter(c => c.id !== id));
            }
        };

        return (
            <div className="max-w-4xl mx-auto mt-6">
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                     <h3 className="text-xl font-bold text-white">{editingId ? 'Editando Contacto' : 'Añadir Nuevo Contacto'}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formState.name} onChange={handleInputChange} placeholder="Nombre del Periodista" className="bg-gray-700 border-gray-600 rounded py-2 px-3 text-white focus:ring-red-500" required />
                        <input name="media" value={formState.media} onChange={handleInputChange} placeholder="Medio de Comunicación" className="bg-gray-700 border-gray-600 rounded py-2 px-3 text-white focus:ring-red-500" required />
                        <input name="phone" value={formState.phone} onChange={handleInputChange} placeholder="Teléfono" className="bg-gray-700 border-gray-600 rounded py-2 px-3 text-white focus:ring-red-500" />
                        <input type="email" name="email" value={formState.email} onChange={handleInputChange} placeholder="Email" className="bg-gray-700 border-gray-600 rounded py-2 px-3 text-white focus:ring-red-500" required />
                     </div>
                     <div className="flex justify-end space-x-3">
                        {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancelar</button>}
                        <button type="submit" className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500">{editingId ? 'Actualizar' : 'Añadir Contacto'}</button>
                     </div>
                </form>

                <div className="space-y-3">
                    {contacts.map(contact => (
                        <div key={contact.id} className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <p className="font-bold text-white text-lg">{contact.name}</p>
                                <p className="text-red-400 font-semibold">{contact.media}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-300 mt-2">
                                   <span>{contact.email}</span>
                                   {contact.phone && <span>{contact.phone}</span>}
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex space-x-2 mt-3 md:mt-0">
                                <button onClick={() => handleEditClick(contact)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-full"><Icon name="edit" className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteClick(contact.id)} className="p-2 text-gray-300 hover:text-white hover:bg-red-800 rounded-full"><Icon name="trash" className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const [activeTab, setActiveTab] = useState('creator');
    return (
        <div className="p-4 md:p-8">
            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('creator')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'creator' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        <Icon name="newspaper" className="w-5 h-5 inline mr-2"/>Crear Comunicado
                    </button>
                    <button onClick={() => setActiveTab('agenda')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'agenda' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                        <Icon name="users" className="w-5 h-5 inline mr-2"/>Agenda de Contactos
                    </button>
                </nav>
            </div>
            {activeTab === 'creator' && <PressReleaseCreator actingSecretaria={actingSecretaria} />}
            {activeTab === 'agenda' && <ContactAgenda />}
        </div>
    );
};

const SocialMediaView = ({ activities }) => {
    const { useState, useCallback, useMemo } = React;
    const socialPlatforms = [ { name: 'Twitter', icon: 'comms' }, { name: 'Facebook', icon: 'comms' }, { name: 'Instagram', icon: 'comms' }, { name: 'TikTok', icon: 'comms' }, { name: 'WhatsApp/Telegram', icon: 'send' } ];
    const [selectedActivityId, setSelectedActivityId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [error, setError] = useState('');
    const [currentTargetPlatform, setCurrentTargetPlatform] = useState('');
    const [copied, setCopied] = useState(false);

    const selectedActivity = useMemo(() => activities.find(act => act.id === selectedActivityId), [activities, selectedActivityId]);

    const handleGenerate = useCallback(async (platform) => {
        if (!selectedActivity) return;
        setIsLoading(true);
        setCurrentTargetPlatform(platform);
        setGeneratedContent('');
        setError('');
        setCopied(false);
        try {
            const result = await generateSocialMediaPost(selectedActivity, platform);
            setGeneratedContent(result);
        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [selectedActivity]);
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg self-start">
                    <h2 className="text-xl font-semibold text-white mb-4">1. Selecciona Actividad</h2>
                    <select value={selectedActivityId} onChange={(e) => { setSelectedActivityId(e.target.value); setGeneratedContent(''); setError(''); }} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2.5 px-3 text-white focus:ring-red-500">
                        <option value="" disabled>-- Elige una actividad --</option>
                        {activities.map(act => (<option key={act.id} value={act.id}>{act.title}</option>))}
                    </select>
                </div>
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                     <h2 className="text-xl font-semibold text-white mb-4">2. Genera Contenido</h2>
                     {!selectedActivity ? ( <div className="flex items-center justify-center h-48 text-gray-500">Selecciona una actividad para empezar.</div> ) : (
                        <div>
                            <div className="flex flex-wrap gap-3 mb-6">
                                {socialPlatforms.map(p => (<button key={p.name} onClick={() => handleGenerate(p.name)} disabled={isLoading} className="flex items-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-red-500 disabled:bg-gray-600"> <Icon name={p.icon} className="w-5 h-5 mr-2" />{p.name}</button>))}
                            </div>
                            {generatedContent && (
                                <div className="relative">
                                  <textarea readOnly value={generatedContent} rows={8} className="w-full bg-gray-900 border-gray-700 rounded p-2 text-gray-200"></textarea>
                                  <button onClick={handleCopyToClipboard} className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded hover:bg-gray-600 text-gray-300">
                                      {copied ? <Icon name="activity" className="w-5 h-5 text-green-400"/> : <Icon name="newspaper" className="w-5 h-5"/>}
                                  </button>
                                </div>
                            )}
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

const Header = ({ title, onMenuClick, actingSecretaria, setActingSecretaria }) => {
    return (
        <header className="bg-gray-800 shadow-md lg:bg-gray-900 z-10">
            <div className="flex items-center justify-between p-4 h-auto md:h-16 flex-wrap md:flex-nowrap gap-4">
                <div className="flex items-center">
                    <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white" aria-label="Open sidebar">
                        <Icon name="menu" className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg md:text-xl font-bold text-white ml-2 md:ml-0">{title}</h1>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto order-last md:order-none">
                     <label htmlFor="secretaria-selector" className="text-sm font-medium text-gray-400 whitespace-nowrap">Actuando como:</label>
                    <select id="secretaria-selector" value={actingSecretaria} onChange={(e) => setActingSecretaria(e.target.value)} className="w-full md:w-auto bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-white text-sm focus:ring-red-500">
                        {Object.values(Secretaria).map(sec => (<option key={sec} value={sec}>{sec}</option>))}
                    </select>
                </div>
            </div>
        </header>
    );
};

// --- MAIN APP COMPONENT ---
const App = () => {
  const { useState, useCallback } = React;
  
  const [currentView, setCurrentView] = useState(View.Dashboard);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [actingSecretaria, setActingSecretaria] = useState(Secretaria.General);
  const [activities, setActivities] = useState([
        { id: '1', title: 'Rueda de prensa sobre la nueva ley laboral', category: ActivityCategory.MediaContact, secretaria: Secretaria.General, description: 'Se convocó a los principales medios para explicar la postura del sindicato sobre la reforma laboral.', relevanceTags: ['prensa', 'reforma laboral'], observations: 'Gran repercusión en medios digitales.', date: '2023-10-26T10:00:00Z' },
        { id: '2', title: 'Taller de comunicación no violenta', category: ActivityCategory.Training, secretaria: Secretaria.Formacion, description: 'Taller impartido para delegados y delegadas para mejorar la gestión de conflictos.', relevanceTags: ['formación interna'], observations: 'Muy valorado por los asistentes.', date: '2023-10-25T15:00:00Z' },
  ]);

  const addActivity = useCallback((activity) => {
    const newActivity = { ...activity, id: new Date().toISOString() + Math.random(), date: new Date().toISOString() };
    setActivities(prev => [newActivity, ...prev]);
  }, []);

  const updateActivity = useCallback((updatedActivity) => {
    setActivities(prev => prev.map(act => act.id === updatedActivity.id ? updatedActivity : act));
  }, []);

  const deleteActivity = useCallback((id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  }, []);
  
  const viewTitles = {
    [View.Dashboard]: 'Dashboard Estratégico',
    [View.ActivityLog]: 'Gestión de Actividades',
    [View.Analytics]: 'Análisis y Métricas',
    [View.ExternalComms]: 'Comunicación Externa',
    [View.SocialMedia]: 'Generador para Redes Sociales',
    [View.InternalComms]: 'Comunicación Interna',
    [View.Resources]: 'Recursos y Guías',
  };

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard: return <DashboardView activities={activities} />;
      case View.ActivityLog: return <ActivityLogView activities={activities} addActivity={addActivity} updateActivity={updateActivity} deleteActivity={deleteActivity} actingSecretaria={actingSecretaria} />;
      case View.Analytics: return <AnalyticsView activities={activities} />;
      case View.ExternalComms: return <ExternalCommsView actingSecretaria={actingSecretaria} />;
      case View.SocialMedia: return <SocialMediaView activities={activities} />;
      case View.Resources: return <ResourcesView />;
      case View.InternalComms: return <InternalCommsView actingSecretaria={actingSecretaria} />;
      default: return <DashboardView activities={activities} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar currentView={currentView} setView={setCurrentView} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
         <Header title={viewTitles[currentView]} onMenuClick={() => setSidebarOpen(true)} actingSecretaria={actingSecretaria} setActingSecretaria={setActingSecretaria} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

// --- RENDER THE APP ---
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);
