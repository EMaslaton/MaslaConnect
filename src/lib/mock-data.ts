import sampleProject1 from "@/assets/sample-project-1.jpg";
import sampleProject4 from "@/assets/sample-project-4.jpg";

export const CATEGORIES = [
  // Diseño
  { label: "Diseño UI/UX", emoji: "🎨", color: "primary" },
  { label: "Diseño Gráfico", emoji: "🖼️", color: "accent" },
  { label: "Branding", emoji: "🏷️", color: "primary" },
  { label: "Ilustración", emoji: "✏️", color: "accent" },
  
  // Desarrollo
  { label: "Desarrollo Web", emoji: "💻", color: "secondary" },
  { label: "Desarrollo Móvil", emoji: "📱", color: "secondary" },
  { label: "Backend", emoji: "⚙️", color: "secondary" },
  { label: "Bases de Datos", emoji: "🗄️", color: "secondary" },
  
  // Video & Multimedia
  { label: "Edición de Video", emoji: "🎬", color: "accent" },
  { label: "Motion Graphics", emoji: "🎞️", color: "accent" },
  { label: "Animación 3D", emoji: "🎥", color: "accent" },
  { label: "Producción de Audio", emoji: "🎧", color: "accent" },
  
  // Marketing & Contenido
  { label: "Redes Sociales", emoji: "📱", color: "primary" },
  { label: "Copywriting", emoji: "✍️", color: "primary" },
  { label: "Marketing Digital", emoji: "📊", color: "primary" },
  { label: "SEO", emoji: "🔍", color: "primary" },
  
  // Fotografía & Contenido Visual
  { label: "Fotografía", emoji: "📸", color: "secondary" },
  { label: "Fotofrafía de Producto", emoji: "📦", color: "secondary" },
  
  // Escritura & Traducción
  { label: "Redacción", emoji: "📝", color: "primary" },
  { label: "Traducción", emoji: "🌍", color: "primary" },
  { label: "Edición de Contenido", emoji: "✂️", color: "primary" },
  
  // Consultoría & Negocios
  { label: "Consultoría", emoji: "💼", color: "accent" },
  { label: "Estrategia Empresarial", emoji: "📈", color: "accent" },
  { label: "Mentoría", emoji: "👨‍🏫", color: "accent" },
  
  // Educación & Tutorías
  { label: "Clases Particulares", emoji: "🎓", color: "secondary" },
  { label: "Entrenamiento Profesional", emoji: "🏋️", color: "secondary" },
  
  // Otros
  { label: "Administración", emoji: "📋", color: "primary" },
  { label: "Atención al Cliente", emoji: "💬", color: "secondary" },
  { label: "Gestión de Proyectos", emoji: "✅", color: "accent" },
  { label: "Otro", emoji: "⭐", color: "primary" },
] as const;

export type Talent = {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  email?: string;
  skills: string[];
  projectImage: string;
  rate: string;
  rating: number;
  reviews: number;
  location: string;
  bio: string;
  projects: { title: string; image: string; category: string }[];
  services: { title: string; description: string; price: string }[];
};

export const TALENTS: Talent[] = [
  {
    id: "1",
    name: "Valentina Reyes",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina&backgroundColor=ffd5dc",
    tagline: "Diseñadora UI que ama el minimalismo",
    email: "valentina@maslaconnect.local",
    skills: ["Diseño UI/UX", "Figma", "Branding"],
    projectImage: sampleProject1,
    rate: "$15/hr",
    rating: 4.8,
    reviews: 12,
    location: "Buenos Aires, AR",
    bio: "Creo interfaces limpias y funcionales. Mi obsesión es que cada pixel tenga propósito. Autodidacta con 2 años diseñando.",
    projects: [
      { title: "App de Meditación", image: sampleProject1, category: "Diseño UI/UX" },
      { title: "Branding Café Local", image: sampleProject4, category: "Branding" },
    ],
    services: [
      { title: "Diseño de App", description: "Diseño completo de interfaz mobile", price: "Desde $200" },
      { title: "Landing Page", description: "Diseño de landing page responsive", price: "Desde $80" },
    ],
  },
];

export const OPPORTUNITIES = [
  {
    id: "1",
    title: "Diseño de Landing Page para Startup",
    budget: "$200 - $400",
    skills: ["Diseño UI/UX", "Figma"],
    company: "TechStart",
    posted: "Hace 2 horas",
    description: "Buscamos diseñador para crear una landing page moderna y atractiva para nuestro producto SaaS.",
  },
  {
    id: "2",
    title: "Videos para TikTok e Instagram",
    budget: "$50 - $100 por video",
    skills: ["Edición de Video", "Redes Sociales"],
    company: "FoodieApp",
    posted: "Hace 5 horas",
    description: "Necesitamos editor de video para crear contenido viral para nuestra app de comida.",
  },
  {
    id: "3",
    title: "Desarrollo de E-commerce con React",
    budget: "$800 - $1200",
    skills: ["React", "TypeScript", "Node.js"],
    company: "ModaLocal",
    posted: "Hace 1 día",
    description: "Tienda online completa para marca de ropa independiente. Incluye carrito y pagos.",
  },
  {
    id: "4",
    title: "Ilustraciones para App Infantil",
    budget: "$300 - $500",
    skills: ["Ilustración", "Procreate"],
    company: "KidsLearn",
    posted: "Hace 3 horas",
    description: "Pack de 20 ilustraciones para app educativa dirigida a niños de 4-8 años.",
  },
];

export const SERVICES = [
  // Valentina Reyes (ID: 1)
  {
    id: "service_1",
    userId: "1",
    title: "Diseño de App",
    description: "Diseño completo de interfaz mobile con Figma. Incluye wireframes, prototipos interactivos y guía de estilos.",
    category: "Diseño UI/UX",
    price: "200",
    rating: 4.8,
    reviews: 12,
    images: [sampleProject1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_2",
    userId: "1",
    title: "Landing Page",
    description: "Diseño de landing page responsive y moderno. Optimizado para conversiones y SEO.",
    category: "Diseño UI/UX",
    price: "80",
    rating: 4.8,
    reviews: 12,
    images: [sampleProject1],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Mateo García (ID: 2)
  {
    id: "service_3",
    userId: "2",
    title: "Sitio Web Completo",
    description: "Desarrollo frontend + backend con React y Node.js. Base de datos, autenticación y deployment.",
    category: "Desarrollo Web",
    price: "400",
    rating: 4.9,
    reviews: 8,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_4",
    userId: "2",
    title: "Landing Page",
    description: "Desarrollo de landing page con animaciones fluidas y efectos interactivos.",
    category: "Desarrollo Web",
    price: "120",
    rating: 4.9,
    reviews: 8,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Camila Torres (ID: 3)
  {
    id: "service_5",
    userId: "3",
    title: "Edición de Reel",
    description: "Reel optimizado para Instagram/TikTok. Incluye efectos, transiciones y música.",
    category: "Edición de Video",
    price: "30",
    rating: 4.7,
    reviews: 15,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_6",
    userId: "3",
    title: "Video YouTube",
    description: "Edición completa de video para YouTube + thumbnail personalizado.",
    category: "Edición de Video",
    price: "80",
    rating: 4.7,
    reviews: 15,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Sebastián López (ID: 4)
  {
    id: "service_7",
    userId: "4",
    title: "Ilustración Custom",
    description: "Ilustración digital personalizada en Procreate. Personaje, objeto o scene según lo que necesites.",
    category: "Ilustración",
    price: "50",
    rating: 5.0,
    reviews: 6,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_8",
    userId: "4",
    title: "Pack de Stickers",
    description: "10 stickers personalizados listos para usar en redes o apps.",
    category: "Ilustración",
    price: "40",
    rating: 5.0,
    reviews: 6,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Lucía Fernández (ID: 5)
  {
    id: "service_9",
    userId: "5",
    title: "Gestión de Redes",
    description: "Plan mensual de contenido + publicación para Instagram, TikTok y Facebook.",
    category: "Redes Sociales",
    price: "150",
    rating: 4.6,
    reviews: 20,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_10",
    userId: "5",
    title: "Estrategia Digital",
    description: "Plan estratégico completo para tu marca. Análisis, propuesta y roadmap.",
    category: "Redes Sociales",
    price: "100",
    rating: 4.6,
    reviews: 20,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Andrés Martínez (ID: 6)
  {
    id: "service_11",
    userId: "6",
    title: "Sesión de Producto",
    description: "10 fotos editadas de producto para e-commerce con iluminación profesional.",
    category: "Fotografía",
    price: "80",
    rating: 4.8,
    reviews: 9,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "service_12",
    userId: "6",
    title: "Sesión Lifestyle",
    description: "Sesión de fotos para redes sociales. Ambiente natural y lifestyle.",
    category: "Fotografía",
    price: "120",
    rating: 4.8,
    reviews: 9,
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MESSAGES = [
  {
    id: "1",
    contact: TALENTS[0],
    lastMessage: "¡Perfecto! Te envío la propuesta en un momento",
    time: "Hace 5 min",
    unread: 2,
    messages: [
      { from: "them", text: "Hola, vi tu perfil y me interesa tu servicio de diseño de app", time: "10:30" },
      { from: "me", text: "¡Hola! Gracias por escribirme. ¿Qué tipo de app tienes en mente?", time: "10:32" },
      { from: "them", text: "Es una app de fitness, necesito el diseño completo", time: "10:35" },
      { from: "me", text: "¡Perfecto! Te envío la propuesta en un momento", time: "10:36" },
    ],
  },
  {
    id: "2",
    contact: TALENTS[2],
    lastMessage: "¿Puedes enviarme ejemplos de tu trabajo anterior?",
    time: "Hace 1 hora",
    unread: 0,
    messages: [
      { from: "them", text: "Hola! Necesito editar un video para YouTube", time: "09:00" },
      { from: "me", text: "¡Claro! ¿De qué trata el video?", time: "09:15" },
      { from: "them", text: "¿Puedes enviarme ejemplos de tu trabajo anterior?", time: "09:20" },
    ],
  },
  {
    id: "3",
    contact: TALENTS[3],
    lastMessage: "Me encantaría trabajar contigo 🎨",
    time: "Ayer",
    unread: 1,
    messages: [
      { from: "them", text: "Vi tus ilustraciones, son increíbles!", time: "Ayer" },
      { from: "me", text: "Me encantaría trabajar contigo 🎨", time: "Ayer" },
    ],
  },
];
