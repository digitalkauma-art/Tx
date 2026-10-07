import { BusinessInfo, Section, SitePage, TemplateId, WebsiteProject } from "../types";

const uid = () => Math.random().toString(36).slice(2, 10);

const templateMeta: Record<TemplateId, {label:string; primary:string; secondary:string; accent:string; font:string}> = {
  modern: {label:"Modern Business", primary:"#0D1422", secondary:"#F5B719", accent:"#00C8BE", font:"Inter"},
  beauty: {label:"Beauty & Salon", primary:"#251F1A", secondary:"#D7B06A", accent:"#F5F7FA", font:"DM Sans"},
  restaurant: {label:"Restaurant", primary:"#17120B", secondary:"#FFC21A", accent:"#E7E0D0", font:"Manrope"},
  school: {label:"School", primary:"#0A1820", secondary:"#FFC21A", accent:"#00D6C7", font:"Inter"},
  construction: {label:"Construction", primary:"#101318", secondary:"#F5B719", accent:"#F5F7FA", font:"Space Grotesk"},
  realestate: {label:"Real Estate", primary:"#101722", secondary:"#F5B719", accent:"#DDE5EE", font:"Manrope"},
  portfolio: {label:"Portfolio", primary:"#080E16", secondary:"#F5B719", accent:"#00C8BE", font:"Inter"},
  professional: {label:"Professional Services", primary:"#0B111B", secondary:"#FFC21A", accent:"#00C8BE", font:"Inter"},
  shop: {label:"Online Shop", primary:"#0A1018", secondary:"#FFC21A", accent:"#00C8BE", font:"Inter"},
  event: {label:"Event", primary:"#11151D", secondary:"#F5B719", accent:"#00D6C7", font:"Manrope"}
};

export const templates = Object.entries(templateMeta).map(([id, v]) => ({id:id as TemplateId, ...v}));

function serviceItems(b: BusinessInfo) {
  const list = b.services.split(/\n|,/).map(x => x.trim()).filter(Boolean).slice(0, 8);
  return (list.length ? list : ["Professional service", "Consultation", "Customer support"]).map(x => ({
    title: x, text: `Professional ${x.toLowerCase()} tailored to your needs.`
  }));
}

function section(type: Section["type"], title: string, text?: string, extra: Partial<Section> = {}): Section {
  return { id: uid(), type, title, text, visible: true, ...extra };
}

export function generateProject(b: BusinessInfo, template: TemplateId): WebsiteProject {
  const meta = templateMeta[template];
  const services = serviceItems(b);
  const isShop = template === "shop" || b.category === "Online Shop";
  const home: SitePage = {
    id: uid(), name: "Home",
    seo: { title: `${b.name} | ${b.type}`, description: b.description || `Discover ${b.name} and its services.`, keywords: `${b.name}, ${b.type}, ${b.location}`, socialImage:"", robots:"index,follow" },
    sections: [
      section("hero", `Welcome to ${b.name}`, b.description || `Professional ${b.type || "services"} in ${b.location || "your area"}.`, {buttonText: b.goal === "Sell products" ? "Shop Now" : "Get Started", buttonHref:"#contact"}),
      section("text", "About Us", b.description || "Tell your customers what makes your business useful, reliable and worth choosing."),
      isShop
        ? section("products", "Featured Products", "Add your products in the editor.", {items: [{title:"Product One", text:"Product description", price:"Price on request"}, {title:"Product Two", text:"Product description", price:"Price on request"}, {title:"Product Three", text:"Product description", price:"Price on request"}]})
        : section("services", "Our Services", "Explore what we offer.", {items: services}),
      section("text", "Why Choose Us", "Clear communication, professional service and a customer-first approach."),
      section("gallery", "Our Work", "Add business photos to showcase your work.", {items: b.photos.slice(0,6).map((p,i)=>({title:`Photo ${i+1}`,text:"",image:p}))}),
      section("testimonials", "What Customers Say", "Customer testimonials can be added here when you have real customer feedback.", {items:[{title:"Customer testimonial",text:"Add a real customer review here."}]}),
      section("cta", "Ready to get started?", "Contact us today and let’s talk about what you need.", {buttonText:"Contact Us",buttonHref:"#contact"}),
      section("contact", "Contact Us", `Phone: ${b.phone || "Add phone number"}\nWhatsApp: ${b.whatsapp || "Add WhatsApp number"}\nEmail: ${b.email || "Add email"}\nLocation: ${b.location || "Add location"}\nHours: ${b.hours || "Add opening hours"}`, {buttonText:"Chat on WhatsApp", buttonHref: b.whatsapp ? `https://wa.me/${b.whatsapp.replace(/\D/g,"")}` : "#contact"}),
      section("footer", b.name, "Professional service. Clear information. Easy contact.")
    ]
  };
  const pages: SitePage[] = [
    home,
    {id:uid(), name:"About", seo:{title:`About ${b.name}`,description:`Learn more about ${b.name}.`,keywords:b.name,socialImage:"",robots:"index,follow"}, sections:[
      section("hero","About Us",b.description || `Learn more about ${b.name}.`),
      section("text","Our Approach","We focus on useful solutions, clear communication and a professional customer experience."),
      section("contact","Get in Touch",`Phone: ${b.phone || "Add phone"}\nEmail: ${b.email || "Add email"}`)
    ]},
    {id:uid(), name:isShop ? "Products" : "Services", seo:{title:`${b.name} ${isShop?"Products":"Services"}`,description:`Explore ${b.name} offerings.`,keywords:b.name,socialImage:"",robots:"index,follow"}, sections:[
      isShop ? section("products","Our Products","Add products, prices and images.",{items:[{title:"Product One",text:"Product description",price:"Price on request"},{title:"Product Two",text:"Product description",price:"Price on request"}]}) : section("services","Our Services","Explore our professional services.",{items:services}),
      section("cta","Need help choosing?","Contact us for enquiries.",{buttonText:"Contact Us",buttonHref:"#contact"})
    ]},
    {id:uid(), name:"Contact", seo:{title:`Contact ${b.name}`,description:`Contact ${b.name}.`,keywords:`contact ${b.name}`,socialImage:"",robots:"index,follow"}, sections:[
      section("contact","Contact Us",`Phone: ${b.phone || "Add phone"}\nWhatsApp: ${b.whatsapp || "Add WhatsApp"}\nEmail: ${b.email || "Add email"}\nLocation: ${b.location || "Add location"}\nHours: ${b.hours || "Add hours"}`,{buttonText:"WhatsApp Us",buttonHref:b.whatsapp?`https://wa.me/${b.whatsapp.replace(/\D/g,"")}`:"#contact"})
    ]}
  ];
  const now = new Date().toISOString();
  return {id:uid(), name:b.name || "Untitled Website", template, business:b, pages, createdAt:now, updatedAt:now, status:"Draft", brand:{primary:meta.primary,secondary:meta.secondary,accent:meta.accent,font:meta.font},freeBranding:true};
}

export function templateLabel(id: TemplateId) {
  return templateMeta[id].label;
}