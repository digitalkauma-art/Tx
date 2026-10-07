import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Bot, Check, ChevronDown, ChevronUp, Download, Eye,
  FileText, Globe, Image as ImageIcon, Layout, Menu, Monitor, Move, Palette,
  Plus, Rocket, Save, Settings, Smartphone, Sparkles, Tablet, Trash2, Wand2,
  X, Copy, Type, MousePointer2
} from "lucide-react";
import { BusinessInfo, Device, Section, SectionType, TemplateId, WebsiteProject } from "./types";
import { generateProject, templateLabel, templates } from "./lib/generator";
import { deleteProject, loadProjects, upsertProject } from "./lib/store";
import { downloadWebsite } from "./lib/exporter";

const categories = ["Business","Restaurant","Salon / Beauty","School","Portfolio","Construction","Real Estate","NGO","Church","Event","Online Shop","Professional Services","Other"];
const goals = ["Get customers","Show services","Sell products","Build a portfolio","Share information","Collect enquiries"] as BusinessInfo["goal"][];
const blankBusiness: BusinessInfo = {name:"",type:"",location:"",phone:"",whatsapp:"",email:"",description:"",services:"",hours:"",goal:"Get customers",category:"Business",photos:[]};

function uid(){return Math.random().toString(36).slice(2,9)}
function App(){
  const [projects,setProjects]=useState<WebsiteProject[]>(loadProjects());
  const [view,setView]=useState<"landing"|"wizard"|"dashboard"|"editor">("landing");
  const [project,setProject]=useState<WebsiteProject|null>(null);
  const [business,setBusiness]=useState<BusinessInfo>(blankBusiness);
  const [step,setStep]=useState(1);
  const [selectedTemplate,setSelectedTemplate]=useState<TemplateId>("modern");
  const [device,setDevice]=useState<Device>("desktop");
  const [selectedSection,setSelectedSection]=useState<string|null>(null);
  const [selectedPage,setSelectedPage]=useState(0);
  const [rightTab,setRightTab]=useState<"settings"|"seo">("settings");
  const [generating,setGenerating]=useState(false);
  const [saved,setSaved]=useState(false);
  const [aiOpen,setAiOpen]=useState(false);
  const [aiPrompt,setAiPrompt]=useState("");
  const [publishState,setPublishState]=useState<"idle"|"preparing"|"uploading"|"publishing"|"success"|"error">("idle");
  const [mobileNav,setMobileNav]=useState(false);

  const sync = (p:WebsiteProject) => {
    const next={...p,updatedAt:new Date().toISOString()};
    setProject(next); upsertProject(next); setProjects(loadProjects()); setSaved(true); setTimeout(()=>setSaved(false),1200);
  };
  const currentPage=project?.pages[selectedPage];
  const selected = currentPage?.sections.find(s=>s.id===selectedSection) || null;

  function startWizard(){setBusiness(blankBusiness);setStep(1);setView("wizard")}
  async function generate(){
    setGenerating(true);
    await new Promise(r=>setTimeout(r,1400));
    const p=generateProject(business,selectedTemplate);
    setProject(p);upsertProject(p);setProjects(loadProjects());setGenerating(false);setView("editor");setSelectedSection(p.pages[0].sections[0].id);
  }
  function editSection(id:string, patch:Partial<Section>){
    if(!project)return;
    const pages=project.pages.map((p,i)=>i!==selectedPage?p:{...p,sections:p.sections.map(s=>s.id===id?{...s,...patch}:s)});
    sync({...project,pages});
  }
  function addSection(type:SectionType){
    if(!project)return;
    const titles:Record<SectionType,string>={hero:"New Hero",text:"New Text Section",services:"Our Services",products:"Our Products",gallery:"Gallery",testimonials:"Testimonials",faq:"FAQ",contact:"Contact Us",map:"Our Location",cta:"Call to Action",footer:"Footer"};
    const s:Section={id:uid(),type,title:titles[type],text:"Add your content here.",visible:true,items:type==="services"?[{title:"Service",text:"Describe this service."}]:undefined};
    const pages=project.pages.map((p,i)=>i===selectedPage?{...p,sections:[...p.sections,s]}:p);
    sync({...project,pages});setSelectedSection(s.id);
  }
  function moveSection(id:string,dir:number){
    if(!project)return;
    const pages=project.pages.map((p,i)=>{
      if(i!==selectedPage)return p;
      const arr=[...p.sections]; const idx=arr.findIndex(x=>x.id===id); const ni=idx+dir;
      if(idx<0||ni<0||ni>=arr.length)return p; [arr[idx],arr[ni]]=[arr[ni],arr[idx]]; return {...p,sections:arr};
    });
    sync({...project,pages});
  }
  function duplicateSection(id:string){
    if(!project)return; const p=project.pages[selectedPage]; const idx=p.sections.findIndex(s=>s.id===id); if(idx<0)return;
    const copy={...p.sections[idx],id:uid(),title:p.sections[idx].title+" Copy",items:p.sections[idx].items?.map(i=>({...i}))};
    const sections=[...p.sections];sections.splice(idx+1,0,copy);sync({...project,pages:project.pages.map((x,i)=>i===selectedPage?{...x,sections}:x)});setSelectedSection(copy.id);
  }
  function deleteSection(id:string){
    if(!project)return; const sections=project.pages[selectedPage].sections.filter(s=>s.id!==id);
    sync({...project,pages:project.pages.map((x,i)=>i===selectedPage?{...x,sections}:x)});setSelectedSection(sections[0]?.id||null);
  }
  function addPage(){
    if(!project)return; const name=prompt("Page name","New Page")?.trim();if(!name)return;
    const p={id:uid(),name,seo:{title:`${name} | ${project.name}`,description:"",keywords:"",socialImage:"",robots:"index,follow"},sections:[{id:uid(),type:"hero" as SectionType,title:name,text:"Add your page content.",visible:true}]};
    sync({...project,pages:[...project.pages,p]});setSelectedPage(project.pages.length);setSelectedSection(p.sections[0].id);
  }
  function removeProject(id:string){if(confirm("Delete this website draft?")){deleteProject(id);setProjects(loadProjects());if(project?.id===id){setProject(null);setView("dashboard")}}}
  async function publish(){
    if(!project)return;
    setPublishState("preparing");await new Promise(r=>setTimeout(r,500));setPublishState("uploading");await new Promise(r=>setTimeout(r,700));setPublishState("publishing");await new Promise(r=>setTimeout(r,700));
    setPublishState("success");sync({...project,status:"Published"});
  }
  function applyAi(){
    if(!project||!selected)return;
    const q=aiPrompt.toLowerCase();
    let title=selected.title,text=selected.text||"";
    if(q.includes("headline")) title=`${project.business.name}: ${project.business.description?project.business.description.split(/[.!?]/)[0]:"Professional solutions, made simple"}`;
    else if(q.includes("short")) text=text.split(".")[0]+".";
    else if(q.includes("professional")) text="Professional solutions, clear communication and a customer-first experience designed around your needs.";
    else if(q.includes("seo")) { const pages=project.pages.map((p,i)=>i===selectedPage?{...p,seo:{...p.seo,title:`${project.business.name} | ${p.name}`,description:`Explore ${p.name.toLowerCase()} from ${project.business.name}.`,keywords:`${project.business.name}, ${p.name}`}}:p); sync({...project,pages}); setAiOpen(false); return; }
    else if(q.includes("services")) { addSection("services");setAiOpen(false);return; }
    else if(q.includes("contact")) { addSection("contact");setAiOpen(false);return; }
    else text="Clear, polished website copy tailored to your customers and business goals.";
    editSection(selected.id,{title,text});setAiOpen(false);setAiPrompt("");
  }

  if(view==="landing") return <Landing onCreate={startWizard} onTemplates={()=>{setView("dashboard")}} projects={projects}/>;
  if(view==="wizard") return <Wizard business={business} setBusiness={setBusiness} step={step} setStep={setStep} template={selectedTemplate} setTemplate={setSelectedTemplate} generating={generating} onGenerate={generate} onBack={()=>setView("landing")} />;
  if(view==="dashboard") return <Dashboard projects={projects} onCreate={startWizard} onEdit={(p)=>{setProject(p);setSelectedPage(0);setSelectedSection(p.pages[0]?.sections[0]?.id||null);setView("editor")}} onDelete={removeProject} onBack={()=>setView("landing")}/>;

  return <Editor project={project!} device={device} setDevice={setDevice} currentPage={currentPage!} selected={selected} selectedSection={selectedSection} setSelectedSection={setSelectedSection} selectedPage={selectedPage} setSelectedPage={setSelectedPage} rightTab={rightTab} setRightTab={setRightTab} editSection={editSection} addSection={addSection} moveSection={moveSection} duplicateSection={duplicateSection} deleteSection={deleteSection} addPage={addPage} onSave={()=>project&&sync(project)} saved={saved} onDownload={()=>project&&downloadWebsite(project)} onPublish={publish} publishState={publishState} onDashboard={()=>setView("dashboard")} aiOpen={aiOpen} setAiOpen={setAiOpen} aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} applyAi={applyAi} mobileNav={mobileNav} setMobileNav={setMobileNav}/>;
}

function Landing({onCreate,onTemplates,projects}:{onCreate:()=>void;onTemplates:()=>void;projects:WebsiteProject[]}){
 return <div className="landing"><header className="site-header"><div className="container nav"><div className="logo-lockup"><div className="mark">K</div><div><strong>KAUMA DESIGN</strong><small>Powered by Kauma Digital</small></div></div><div className="nav-actions"><button className="ghost" onClick={onTemplates}>Explore Templates</button><button className="gold-btn" onClick={onCreate}>Create My Website</button></div></div></header>
 <main><section className="hero-landing"><div className="container hero-grid"><div><div className="pill"><Sparkles size={15}/> Professional website creation</div><h1>Build your website <span>in minutes.</span></h1><p>Tell us about your business and Kauma Design creates a professional website you can customize, preview and publish.</p><div className="hero-buttons"><button className="gold-btn big" onClick={onCreate}>Create My Website <ArrowRight size={18}/></button><button className="outline-btn big" onClick={onTemplates}>Explore Templates</button></div><div className="trust-row"><span><Check size={15}/> Mobile-ready</span><span><Check size={15}/> Visual editor</span><span><Check size={15}/> Download anytime</span></div></div><div className="product-preview"><div className="browser-bar"><span></span><span></span><span></span><label>kauma.design / preview</label></div><div className="preview-site"><div className="mini-nav"><b>YOUR BUSINESS</b><span>About</span><span>Services</span><span>Contact</span></div><div className="mini-hero"><small>YOUR BUSINESS</small><h3>Professional solutions.<br/>Built around you.</h3><button>Get Started</button></div><div className="mini-cards"><i></i><i></i><i></i></div></div></div></div></section>
 <section className="features container"><div className="section-heading"><span>WHY KAUMA DESIGN</span><h2>Everything you need to go from idea to website.</h2></div><div className="feature-grid">{[["AI-assisted creation","Start with your business details and generate polished pages automatically.",Bot],["Visual editing","Click your content, edit it directly and see the result instantly.",MousePointer2],["Mobile-friendly","Preview desktop, tablet and mobile layouts before you publish.",Smartphone],["Professional templates","Choose a purpose-built layout for your industry.",Layout],["Custom domains","Prepare your premium domain connection when you are ready.",Globe],["Download your website","Export a standalone website package you can host anywhere.",Download],["Publish online","Connect Cloudflare deployment infrastructure when configured.",Rocket]].map(([t,d,I])=><div className="feature" key={t as string}><div className="icon-box"><I size={19}/></div><h3>{t as string}</h3><p>{d as string}</p></div>)}</div></section>
 <section className="workflow"><div className="container"><div className="section-heading"><span>HOW IT WORKS</span><h2>Simple enough for anyone. Powerful enough for a business.</h2></div><div className="steps">{["Tell us about your business","Choose a professional template","Kauma Design generates your site","Edit, preview and publish"].map((x,i)=><div className="step" key={x}><b>0{i+1}</b><span>{x}</span></div>)}</div></div></section></main>
 <footer className="site-footer"><div className="container footer-row"><div><strong>KAUMA DESIGN</strong><p>Powered by Kauma Digital</p></div><span>© Kauma Digital — Kauma Design</span></div></footer></div>
}

function Wizard({business,setBusiness,step,setStep,template,setTemplate,generating,onGenerate,onBack}:{business:BusinessInfo;setBusiness:(b:BusinessInfo)=>void;step:number;setStep:(n:number)=>void;template:TemplateId;setTemplate:(t:TemplateId)=>void;generating:boolean;onGenerate:()=>void;onBack:()=>void}){
 const update=(k:keyof BusinessInfo,v:any)=>setBusiness({...business,[k]:v});
 if(generating)return <div className="generating"><div className="gen-ring"><Sparkles/></div><h1>Generating your website...</h1><p>Kauma Design is turning your business information into a polished site.</p><div className="loader"></div></div>;
 return <div className="wizard-shell"><header className="wizard-header"><button className="icon-btn" onClick={onBack}><ArrowLeft/></button><div className="logo-lockup"><div className="mark">K</div><div><strong>KAUMA DESIGN</strong><small>Powered by Kauma Digital</small></div></div><span>Step {step} of 3</span></header><div className="wizard-progress"><i style={{width:`${step/3*100}%`}}></i></div><main className="wizard-main"><div className="wizard-copy"><span className="eyebrow">CREATE YOUR WEBSITE</span><h1>{step===1?"Tell us about your business.":step===2?"Choose your website direction.":"Choose a professional template."}</h1><p>{step===1?"A few details are enough. You can refine everything later.":step===2?"Tell Kauma Design what the website needs to achieve.": "Your template changes the layout and visual direction of the generated site."}</p></div>
 {step===1&&<div className="form-grid">{[["name","Business name","e.g. Aquamoose Water Solutions"],["type","Business type","e.g. Borehole drilling"],["location","Location","City / area"],["phone","Phone number","+254 ..."],["whatsapp","WhatsApp number","+254 ..."],["email","Email","hello@example.com"],["hours","Opening hours","Mon–Fri, 8am–5pm"]].map(([k,l,p])=><label className="field" key={k}><span>{l}</span><input value={(business as any)[k]} placeholder={p} onChange={e=>update(k as any,e.target.value)}/></label>)}<label className="field full"><span>Business description</span><textarea value={business.description} placeholder="What does your business do? Who do you serve?" onChange={e=>update("description",e.target.value)}/></label><label className="field full"><span>Services offered</span><textarea value={business.services} placeholder="List services separated by commas or new lines." onChange={e=>update("services",e.target.value)}/></label></div>}
 {step===2&&<div className="goal-grid"><div className="category-block"><h3>Website category</h3><div className="chip-grid">{categories.map(c=><button className={business.category===c?"chip active":"chip"} onClick={()=>update("category",c)} key={c}>{c}</button>)}</div></div><div className="category-block"><h3>Website goal</h3><div className="goal-list">{goals.map(g=><button className={business.goal===g?"goal active":"goal"} onClick={()=>update("goal",g)} key={g}><span>{g}</span><ArrowRight size={16}/></button>)}</div></div></div>}
 {step===3&&<div className="template-grid">{templates.map(t=><button className={template===t.id?"template-card active":"template-card"} onClick={()=>setTemplate(t.id)} key={t.id}><div className="template-thumb" style={{background:t.primary}}><div style={{background:t.secondary}}></div><span style={{background:t.accent}}></span></div><strong>{t.label}</strong><small>Purpose-built layout</small></button>)}</div>}
 <div className="wizard-actions">{step>1?<button className="outline-btn" onClick={()=>setStep(step-1)}>Back</button>:<span/>}{step<3?<button className="gold-btn" onClick={()=>setStep(step+1)}>Continue <ArrowRight size={17}/></button>:<button className="gold-btn" onClick={onGenerate}><Wand2 size={17}/> Generate Website</button>}</div></main></div>
}

function Dashboard({projects,onCreate,onEdit,onDelete,onBack}:{projects:WebsiteProject[];onCreate:()=>void;onEdit:(p:WebsiteProject)=>void;onDelete:(id:string)=>void;onBack:()=>void}){
 return <div className="dashboard"><header className="dash-header"><div className="container nav"><button className="icon-btn" onClick={onBack}><ArrowLeft/></button><div className="logo-lockup"><div className="mark">K</div><div><strong>KAUMA DESIGN</strong><small>Powered by Kauma Digital</small></div></div><button className="gold-btn" onClick={onCreate}><Plus size={17}/> Create Website</button></div></header><main className="container dash-main"><div className="dash-title"><div><span className="eyebrow">WORKSPACE</span><h1>My Websites</h1><p>Build, edit, preview and export your sites.</p></div></div>{projects.length===0?<div className="empty-state"><div className="icon-box"><Layout/></div><h2>No websites yet</h2><p>Create your first professional website in minutes.</p><button className="gold-btn" onClick={onCreate}>Create My Website</button></div>:<div className="project-grid">{projects.map(p=><div className="project-card" key={p.id}><div className="project-thumb" style={{background:p.brand.primary}}><span>{p.name.slice(0,1).toUpperCase()}</span><small>{templateLabel(p.template)}</small></div><div className="project-info"><div><h3>{p.name}</h3><span className={p.status==="Published"?"status published":"status"}>{p.status}</span></div><small>Last edited {new Date(p.updatedAt).toLocaleString()}</small><div className="project-actions"><button onClick={()=>onEdit(p)}><MousePointer2 size={15}/> Edit</button><button onClick={()=>onEdit(p)}><Eye size={15}/> Preview</button><button onClick={()=>downloadWebsite(p)}><Download size={15}/> Download</button><button onClick={()=>onDelete(p.id)} className="danger"><Trash2 size={15}/> Delete</button></div></div></div>)}</div>}</main><footer className="site-footer"><div className="container footer-row"><span>© Kauma Digital — Kauma Design</span><span>Local workspace mode</span></div></footer></div>
}

function Editor(props:any){
 const {project,device,setDevice,currentPage,selected,selectedSection,setSelectedSection,selectedPage,setSelectedPage,rightTab,setRightTab,editSection,addSection,moveSection,duplicateSection,deleteSection,addPage,onSave,saved,onDownload,onPublish,publishState,onDashboard,aiOpen,setAiOpen,aiPrompt,setAiPrompt,applyAi,mobileNav,setMobileNav}=props;
 const [leftTab,setLeftTab]=useState("Sections");
 const [showAdd,setShowAdd]=useState(false);
 const updateItem=(idx:number,patch:any)=>{const items=(selected?.items||[]).map((x:any,i:number)=>i===idx?{...x,...patch}:x);editSection(selected.id,{items})};
 const uploadImage=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f||!selected)return;const url=URL.createObjectURL(f);editSection(selected.id,{image:url});};
 const uploadItemImage=(idx:number,e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f||!selected)return;const url=URL.createObjectURL(f);updateItem(idx,{image:url});};
 return <div className="editor-app"><header className="editor-top"><div className="editor-brand"><button className="icon-btn" onClick={onDashboard}><ArrowLeft/></button><div className="logo-lockup compact"><div className="mark">K</div><div><strong>KAUMA DESIGN</strong><small>Powered by Kauma Digital</small></div></div></div><div className="device-switch"><button className={device==="desktop"?"active":""} onClick={()=>setDevice("desktop")}><Monitor/> Desktop</button><button className={device==="tablet"?"active":""} onClick={()=>setDevice("tablet")}><Tablet/> Tablet</button><button className={device==="mobile"?"active":""} onClick={()=>setDevice("mobile")}><Smartphone/> Mobile</button></div><div className="top-actions"><button className="icon-btn" onClick={onSave} title="Save"><Save/></button><button className="outline-btn" onClick={onDownload}><Download size={16}/> Download Website</button><button className="gold-btn" onClick={onPublish}><Rocket size={16}/> Publish</button></div></header><div className="editor-body"><aside className={`left-sidebar ${mobileNav?"open":""}`}><div className="mobile-close"><button onClick={()=>setMobileNav(false)}><X/></button></div><div className="side-title"><strong>Website</strong><span>{saved?"Saved":"Draft"}</span></div><div className="page-list">{project.pages.map((p:any,i:number)=><button className={i===selectedPage?"page-btn active":"page-btn"} key={p.id} onClick={()=>{setSelectedPage(i);setSelectedSection(p.sections[0]?.id)}}><FileText size={15}/>{p.name}</button>)}<button className="add-page" onClick={addPage}><Plus size={15}/> Add Page</button></div><div className="side-tabs">{["Sections","Design","SEO"].map(x=><button className={leftTab===x?"active":""} onClick={()=>setLeftTab(x)} key={x}>{x}</button>)}</div>{leftTab==="Sections"&&<div className="section-list">{currentPage.sections.map((s:any,i:number)=><div className={selectedSection===s.id?"section-row active":"section-row"} key={s.id} onClick={()=>setSelectedSection(s.id)}><Move size={14}/><span>{s.title}</span><div><button onClick={e=>{e.stopPropagation();moveSection(s.id,-1)}}><ChevronUp size={13}/></button><button onClick={e=>{e.stopPropagation();moveSection(s.id,1)}}><ChevronDown size={13}/></button></div></div>)}<button className="add-section" onClick={()=>setShowAdd(!showAdd)}><Plus size={15}/> Add Section</button>{showAdd&&<div className="add-menu">{(["hero","text","services","products","gallery","testimonials","faq","contact","map","cta","footer"] as SectionType[]).map(x=><button key={x} onClick={()=>{addSection(x);setShowAdd(false)}}>{x}</button>)}</div>}</div>}{leftTab==="Design"&&<DesignPanel project={project} editProject={(patch:any)=>props.onProject?.(patch)}/>} {leftTab==="SEO"&&<div className="side-panel"><p>SEO settings for the current page are available in the right panel when a page is selected.</p></div>}</aside><main className="canvas"><button className="mobile-menu-btn" onClick={()=>setMobileNav(true)}><Menu/></button><div className="canvas-label"><span>LIVE PREVIEW</span><span>{currentPage.name}</span></div><div className={`preview-frame ${device}`}><Preview project={project} page={currentPage} selectedSection={selectedSection} setSelectedSection={setSelectedSection}/></div></main><aside className="right-sidebar"><div className="right-tabs"><button className={rightTab==="settings"?"active":""} onClick={()=>setRightTab("settings")}>Element</button><button className={rightTab==="seo"?"active":""} onClick={()=>setRightTab("seo")}>SEO</button></div>{rightTab==="seo"?<SEOPanel project={project} page={currentPage} selectedPage={selectedPage} sync={props.sync}/>:selected?<ElementPanel selected={selected} editSection={editSection} uploadImage={uploadImage} updateItem={updateItem} uploadItemImage={uploadItemImage} duplicate={()=>duplicateSection(selected.id)} remove={()=>deleteSection(selected.id)}/>:<div className="inspector-empty"><MousePointer2/><h3>Select an element</h3><p>Click a section in the preview or left panel to edit it.</p></div>} </aside></div>{aiOpen&&<div className="ai-modal"><div className="ai-card"><div className="ai-head"><div><span className="eyebrow">KAUMA AI</span><h2>Ask Kauma AI</h2></div><button onClick={()=>setAiOpen(false)}><X/></button></div><p>Ask for a targeted change. Kauma AI will modify only the selected section.</p><textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} placeholder="e.g. Rewrite this section to sound more professional."/><div className="ai-suggestions">{["Rewrite this section","Make this more professional","Create a better headline","Make this shorter","Create SEO description","Add a services section"].map(x=><button onClick={()=>setAiPrompt(x)} key={x}>{x}</button>)}</div><button className="gold-btn full-btn" onClick={applyAi}><Wand2 size={16}/> Apply with Kauma AI</button></div></div>}{publishState!=="idle"&&<div className="publish-toast"><strong>{publishState==="success"?"Published successfully":publishState==="error"?"Publishing failed":publishState==="preparing"?"Preparing...":publishState==="uploading"?"Uploading...":"Publishing..."}</strong>{publishState!=="success"&&publishState!=="error"&&<div className="loader small"></div>}{publishState==="success"&&<Check/>}</div>}<button className="ask-ai" onClick={()=>setAiOpen(true)}><Bot size={18}/> Ask Kauma AI</button></div>
}

function Preview({project,page,selectedSection,setSelectedSection}:{project:WebsiteProject;page:any;selectedSection:string|null;setSelectedSection:(x:string)=>void}){
 return <div className="site-preview" style={{"--p":project.brand.primary,"--g":project.brand.secondary,"--a":project.brand.accent} as React.CSSProperties}><div className="customer-nav"><strong>{project.business.name||"Your Business"}</strong><div>{project.pages.map((p:any)=><span key={p.id}>{p.name}</span>)}</div></div>{page.sections.map((s:any)=><div key={s.id} onClick={()=>setSelectedSection(s.id)} className={`editable-section ${selectedSection===s.id?"selected":""}`}>{s.type==="hero"&&<div className="customer-hero"><span>{project.business.type||"PROFESSIONAL SERVICE"}</span><h1>{s.title}</h1><p>{s.text}</p>{s.buttonText&&<button>{s.buttonText}</button>}</div>}{s.type==="text"&&<div className="customer-content"><h2>{s.title}</h2><p>{s.text}</p></div>}{s.type==="services"&&<div className="customer-content"><h2>{s.title}</h2><p>{s.text}</p><div className="customer-grid">{(s.items||[]).map((i:any)=><article key={i.title}><div className="service-dot"></div><h3>{i.title}</h3><p>{i.text}</p></article>)}</div></div>}{s.type==="products"&&<div className="customer-content"><h2>{s.title}</h2><p>{s.text}</p><div className="customer-grid">{(s.items||[]).map((i:any)=><article key={i.title}>{i.image&&<img src={i.image} alt={i.title}/>}<h3>{i.title}</h3><p>{i.text}</p><strong>{i.price}</strong></article>)}</div></div>}{s.type==="gallery"&&<div className="customer-content"><h2>{s.title}</h2><div className="customer-gallery">{(s.items||[]).map((i:any)=><div key={i.title}>{i.image?<img src={i.image} alt={i.title}/>:<div className="image-placeholder"><ImageIcon/></div>}</div>)}</div></div>}{["testimonials","faq","contact","map","cta"].includes(s.type)&&<div className={`customer-content special ${s.type}`}><h2>{s.title}</h2><p>{s.text}</p>{s.buttonText&&<button>{s.buttonText}</button>}</div>}{s.type==="footer"&&<footer className="customer-footer"><strong>{s.title}</strong><p>{s.text}</p>{project.freeBranding&&<small>Built with Kauma Design</small>}</footer>}</div>)}</div>
}

function ElementPanel({selected,editSection,uploadImage,updateItem,uploadItemImage,duplicate,remove}:{selected:Section;editSection:any;uploadImage:any;updateItem:any;uploadItemImage:any;duplicate:any;remove:any}){
 return <div className="inspector"><div className="inspector-title"><div><span className="eyebrow">EDIT SECTION</span><h3>{selected.type}</h3></div><div className="row-actions"><button onClick={duplicate}><Copy size={15}/></button><button onClick={remove} className="danger"><Trash2 size={15}/></button></div></div><label className="field"><span>Heading</span><input value={selected.title} onChange={e=>editSection(selected.id,{title:e.target.value})}/></label><label className="field"><span>Content</span><textarea value={selected.text||""} onChange={e=>editSection(selected.id,{text:e.target.value})}/></label>{selected.buttonText!==undefined&&<><label className="field"><span>Button text</span><input value={selected.buttonText||""} onChange={e=>editSection(selected.id,{buttonText:e.target.value})}/></label><label className="field"><span>Button destination</span><input value={selected.buttonHref||""} onChange={e=>editSection(selected.id,{buttonHref:e.target.value})}/></label></>}{selected.type==="hero"&&<label className="upload-box"><ImageIcon/><span>Replace hero image</span><input type="file" accept="image/*" onChange={uploadImage}/></label>}{["services","products"].includes(selected.type)&&<div className="item-editor"><div className="item-head"><strong>Items</strong><button onClick={()=>updateItem((selected.items||[]).length,{title:"New item",text:"Description",price:selected.type==="products"?"Price on request":undefined})}><Plus size={15}/></button></div>{(selected.items||[]).map((i:any,idx:number)=><div className="item-row" key={idx}><input value={i.title} onChange={e=>updateItem(idx,{title:e.target.value})}/><textarea value={i.text} onChange={e=>updateItem(idx,{text:e.target.value})}/>{selected.type==="products"&&<input value={i.price||""} onChange={e=>updateItem(idx,{price:e.target.value})} placeholder="Price"/>}<label className="mini-upload">Image<input type="file" accept="image/*" onChange={e=>uploadItemImage(idx,e)}/></label></div>)}</div>}{selected.type==="gallery"&&<div className="item-editor"><div className="item-head"><strong>Gallery images</strong></div>{(selected.items||[]).map((i:any,idx:number)=><label className="mini-upload gallery-upload" key={idx}>{i.image?<img src={i.image} alt=""/>:<span>Upload image {idx+1}</span>}<input type="file" accept="image/*" onChange={e=>uploadItemImage(idx,e)}/></label>)}</div>}<label className="toggle-row"><span>Visible</span><input type="checkbox" checked={selected.visible} onChange={e=>editSection(selected.id,{visible:e.target.checked})}/></label></div>
}

function SEOPanel({project,page,selectedPage,sync}:any){
 const update=(patch:any)=>sync({...project,pages:project.pages.map((p:any,i:number)=>i===selectedPage?{...p,seo:{...p.seo,...patch}}:p)});
 return <div className="inspector"><div className="inspector-title"><div><span className="eyebrow">SEARCH</span><h3>SEO Settings</h3></div></div>{[["title","Page title"],["description","Meta description"],["keywords","Keywords"],["socialImage","Social sharing image"]].map(([k,l])=><label className="field" key={k}><span>{l}</span><textarea value={page.seo[k]} onChange={e=>update({[k]:e.target.value})}/></label>)}<label className="field"><span>Robots</span><select value={page.seo.robots} onChange={e=>update({robots:e.target.value})}><option>index,follow</option><option>noindex,nofollow</option></select></label></div>
}

function DesignPanel({project}:any){
 return <div className="side-panel"><div className="design-swatch" style={{background:project.brand.primary}}><span>Primary</span></div><div className="design-swatch" style={{background:project.brand.secondary,color:"#111"}}><span>Gold</span></div><div className="design-swatch" style={{background:project.brand.accent,color:"#111"}}><span>Accent</span></div><p>Template: <strong>{templateLabel(project.template)}</strong></p><p>Font: <strong>{project.brand.font}</strong></p><small>Customer colours can be refined here in a future theme editor without changing the builder's Kauma Design chrome.</small></div>
}

