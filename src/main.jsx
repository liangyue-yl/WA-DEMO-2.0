import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { 
  User, MessageSquare, Shield, Zap, Send, Menu, X, CheckCircle2, 
  DollarSign, FileText, Smartphone, Layout, UserCircle, Users, 
  ArrowLeft, ClipboardCheck, Bell, ChevronRight, Clock, Info,
  UserPlus, PencilLine, Eye, RefreshCw, Download, ExternalLink, ListChecks
} from 'lucide-react';

// --- Global Mock Data ---
const AGENT_NAME = "Agent Zhang (Senior Consultant)";
const MOCK_CUSTOMERS = [
  { id: 'c1', name: "Mr. Wang", occupation: "Delivery Rider", status: "Hot Lead", lastMsg: "I am a delivery rider" },
  { id: 'c2', name: "Ms. Li", occupation: "Graphic Designer", status: "Consulting", lastMsg: "Interested in Life Insurance" },
];

const App = () => {
  // --- Core States ---
  const [activeCid, setActiveCid] = useState('c1');
  const [customerChats, setCustomerChats] = useState({
    c1: [
      { id: 1, sender: 'system', text: `Entered via Agent Personal Brand Page`, time: '10:00 AM' },
      { id: 2, sender: 'ai', text: `Hello! I'm ${AGENT_NAME}'s Digital Assistant. I see you're interested in Personal Accident coverage. What's your current occupation?`, time: '10:01 AM' }
    ],
    c2: [
      { id: 1, sender: 'system', text: `Entered via QR Code Scan`, time: '09:30 AM' },
      { id: 2, sender: 'ai', text: `Welcome back, Ms. Li! How can I assist you today?`, time: '09:31 AM' }
    ]
  });

  const [copilotChats, setCopilotChats] = useState({
    c1: [{ id: 'a1', sender: 'sys_bot', text: "🔔 New Lead: Mr. Wang (Accident Insurance Inquiry)", time: '10:01 AM' }],
    c2: [{ id: 'a1', sender: 'sys_bot', text: "🔔 Active Lead: Ms. Li (Term Life Inquiry)", time: '09:31 AM' }]
  });

  // Synced Global Data (Database State)
  const [formData, setFormData] = useState({
    name: "",
    age: "30",
    idNumber: "",
    beneficiary: "",
    hoursOnRoad: "1-4 Hours",
    planName: "SafeCycle PA Plan",
    premium: "199",
    step: 0, // Global step in the DB
    isAgentAssisting: false, // Who owns the UI focus?
  });

  // LOCAL UI STATES - 100% ISOLATED
  const [customerShowDetails, setCustomerShowDetails] = useState(false);
  const [agentShowDetails, setAgentShowDetails] = useState(false);

  const [inputTexts, setInputTexts] = useState({ customer: "", agent: "" });
  const [isSwitchingLeads, setIsSwitchingLeads] = useState(false);
  
  const chatEndRef = useRef(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [customerChats, copilotChats, activeCid]);

  const downloadPDF = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCustomerChats(prev => ({
      ...prev,
      [activeCid]: [...(prev[activeCid] || []), { id: Date.now(), sender: 'system', text: "Policy PDF download started", time }]
    }));
  };

  const handleSendMessage = (side, text) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sender = side === 'customer' ? 'user' : 'agent';
    
    setCustomerChats(prev => ({
      ...prev,
      [activeCid]: [...(prev[activeCid] || []), { id: Date.now(), sender, text, time }]
    }));
    setCopilotChats(prev => ({
      ...prev,
      [activeCid]: [...(prev[activeCid] || []), { id: Date.now() + 1, sender, text, time }]
    }));

    if (side === 'customer') {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('delivery') || lowerText.includes('rider')) {
        setTimeout(() => {
          setFormData(f => ({ ...f, planName: "SafeCycle PA Plan", premium: "199" }));
          setCopilotChats(prev => ({
            ...prev, 
            [activeCid]: [...(prev[activeCid] || []), {
              id: Date.now() + 2,
              sender: 'sys_bot',
              text: "🚨 Copilot Insight: High-risk occupation. Suggest SafeCycle Plan. Assist?",
              type: 'action_required',
              time
            }]
          }));
        }, 800);
      } else if (lowerText.includes('worker') || lowerText.includes('office')) {
        setTimeout(() => {
          setFormData(f => ({ ...f, planName: "Office Elite Plan", premium: "99" }));
          setCopilotChats(prev => ({
            ...prev, 
            [activeCid]: [...(prev[activeCid] || []), {
              id: Date.now() + 2,
              sender: 'sys_bot',
              text: "✅ Copilot Insight: Low-risk lead. Suggest Office Elite Plan. Assist?",
              type: 'action_required',
              time
            }]
          }));
        }, 800);
      }
    }
    setInputTexts(prev => ({ ...prev, [side]: "" }));
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const triggerFlow = (isAgentLead = false) => {
    if (isAgentLead) {
      setFormData(prev => ({ ...prev, step: 1, isAgentAssisting: true }));
    } else {
      setFormData(prev => ({ ...prev, isAgentAssisting: false, step: 0 }));
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const flowMsg = [
        { id: Date.now(), sender: 'agent', text: `I've prepared the ${formData.planName} application. Please click below to start.`, time },
        { id: Date.now() + 1, sender: 'interactive', text: `Apply for ${formData.planName}`, type: 'flow_button', time }
      ];
      setCustomerChats(prev => ({ ...prev, [activeCid]: [...(prev[activeCid] || []), ...flowMsg] }));
    }
  };

  const switchLead = (id) => {
    setActiveCid(id);
    setIsSwitchingLeads(false);
  };

  // --- Components ---

  const PhoneContainer = ({ title, side, children, isAgent = false, subtitle = "" }) => (
    <div className="flex flex-col w-[380px] h-[720px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative font-sans">
      <div className="h-8 bg-slate-800 flex justify-between items-center px-8 text-[10px] text-white">
        <span>9:41</span>
        <div className="flex gap-1 items-center"><div className="w-3 h-2 bg-white/40 rounded-sm"></div><div className="w-2 h-2 bg-white/40 rounded-full"></div></div>
      </div>
      <div className={`p-4 flex items-center gap-3 ${isAgent ? 'bg-indigo-900' : 'bg-[#075E54]'} text-white shadow-md z-10`}>
        {isAgent ? (
          <button onClick={() => setIsSwitchingLeads(true)} className="p-1 hover:bg-white/10 rounded transition-colors"><Users size={20} /></button>
        ) : <UserCircle size={24} />}
        <div className="flex-1 min-w-0 text-white">
          <div className="font-bold text-sm truncate">{title}</div>
          <div className="text-[10px] opacity-80 truncate uppercase tracking-tighter">{subtitle || (isAgent ? 'Sales Copilot Console' : 'Personal Agent')}</div>
        </div>
        {isAgent && <Bell size={16} className="text-white opacity-60" />}
      </div>
      <div className="flex-1 bg-[#e5ddd5] overflow-y-auto p-4 flex flex-col gap-2 relative scrollbar-hide">
        {children}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(side, inputTexts[side]); }} className="p-3 bg-white flex items-center gap-2 border-t border-slate-200">
        <input type="text" value={inputTexts[side]} onChange={(e) => setInputTexts(prev => ({ ...prev, [side]: e.target.value }))} placeholder="Type a message..." className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 shadow-inner" />
        <button type="submit" disabled={!inputTexts[side].trim()} className={`p-2 rounded-full text-white transition-all ${!inputTexts[side].trim() ? 'opacity-30' : 'opacity-100 active:scale-90'} ${isAgent ? 'bg-indigo-700' : 'bg-[#128C7E]'}`}><Send size={18} /></button>
      </form>
      {isAgent && isSwitchingLeads && (
        <div className="absolute inset-0 bg-slate-900 z-50 animate-in slide-in-from-left duration-300">
          <div className="p-6 pt-12 text-white">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-4">
              <button onClick={() => setIsSwitchingLeads(false)} className="p-1 hover:bg-white/10 rounded text-white"><ArrowLeft size={24} /></button>
              <h2 className="text-xl font-bold tracking-tight text-white">Active Leads</h2>
            </div>
            {MOCK_CUSTOMERS.map(c => (
              <div key={c.id} onClick={() => switchLead(c.id)} className={`p-4 rounded-2xl mb-2 cursor-pointer transition-all ${activeCid === c.id ? 'bg-indigo-700 shadow-lg ring-1 ring-indigo-400' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="font-bold text-sm text-white">{c.name}</div>
                <div className="text-[10px] opacity-60 uppercase text-white">{c.occupation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const MessageBubble = ({ msg, isAgentView }) => {
    if (msg.sender === 'system') return <div className="self-center bg-white/60 text-[9px] px-3 py-1 rounded-md my-2 text-slate-600 uppercase text-center tracking-tight shadow-sm font-bold">{msg.text}</div>;
    if (msg.type === 'action_required') return (
      <div className="self-start bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500 w-72 my-1 text-slate-800">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-[10px] uppercase tracking-wider"><Zap size={14} className="fill-indigo-700"/> Copilot Suggestion</div>
        <p className="text-xs mb-4 leading-relaxed font-medium">{msg.text}</p>
        <div className="flex gap-2">
          <button onClick={() => triggerFlow(false)} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold text-[10px] uppercase shadow-sm active:scale-95 transition-transform tracking-wider text-center">Push Flow</button>
          <button onClick={() => triggerFlow(true)} className="flex-1 py-2 border border-indigo-600 text-indigo-600 rounded font-bold text-[10px] uppercase active:scale-95 transition-transform tracking-wider text-center">Assist Entry</button>
        </div>
      </div>
    );
    if (msg.type === 'flow_button') return (
      <div className="self-start bg-white rounded-lg shadow-md p-3 border-l-4 border-[#128C7E] w-64 my-1 text-slate-800">
        <button onClick={() => !isAgentView && setFormData(f => ({...f, step: 1, isAgentAssisting: false}))} className="w-full py-2 bg-[#128C7E] text-white rounded font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm">
          <FileText size={14} /> {msg.text}
        </button>
        <button onClick={() => !isAgentView ? setCustomerShowDetails(true) : setAgentShowDetails(true)} className="w-full mt-2 py-1 flex items-center justify-center gap-1 text-[10px] font-bold text-[#128C7E] hover:underline transition-all">
          <ListChecks size={12} /> View Coverage Details
        </button>
      </div>
    );
    const isMine = isAgentView ? (msg.sender === 'agent') : (msg.sender === 'user');
    return (
      <div className={`max-w-[80%] p-2 rounded-lg text-xs shadow-sm my-0.5 ${isMine ? 'self-end bg-[#dcf8c6]' : 'self-start bg-white'} relative text-slate-800`}>
        <div className="flex flex-col text-slate-800">
          <span className="leading-normal">{msg.text}</span>
          <span className="text-[8px] text-slate-400 self-end mt-1 font-mono">{msg.time}</span>
        </div>
      </div>
    );
  };

  // --- WhatsApp Flow Native UI ---
  const WhatsAppFlow = ({ isAgentSide = false, isDetailsActive, setDetailsActive }) => {
    // CRITICAL: Strict isolation condition for visibility
    const isActuallyAssisting = formData.isAgentAssisting && formData.step > 0;
    
    // For Customer: Show if NOT being assisted AND progress > 0 OR if local details active
    // For Agent: Show if BEING assisted AND progress > 0 OR if local details active
    const shouldMount = isAgentSide 
      ? (isActuallyAssisting || isDetailsActive)
      : ((formData.step > 0 && !formData.isAgentAssisting) || isDetailsActive);

    if (!shouldMount) return null;
    
    return (
      <div className={`absolute inset-0 bg-black/40 z-40 flex flex-col justify-end transition-opacity duration-300`}>
        <div className="bg-white rounded-t-[2.5rem] w-full min-h-[70%] max-h-[90%] shadow-2xl flex flex-col animate-slide-up relative text-slate-800">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[2.5rem] z-10 text-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#128C7E] rounded-lg flex items-center justify-center text-white shadow-sm"><Shield size={16}/></div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm truncate max-w-[180px]">{formData.planName}</h4>
                {isDetailsActive ? (
                  <p className="text-[9px] text-[#128C7E] uppercase tracking-widest font-bold">Benefit Coverage</p>
                ) : formData.step > 0 && (
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Step {formData.step} of 5</p>
                )}
              </div>
            </div>
            <button onClick={() => {
              if (isDetailsActive) setDetailsActive(false);
              else setFormData(f => ({...f, step: 0, isAgentAssisting: false}));
            }} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative text-slate-800">
            {isDetailsActive ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
                  <h6 className="font-black text-[11px] mb-4 uppercase text-indigo-700 tracking-wider flex items-center gap-2"><Shield size={16}/> Policy Highlights</h6>
                  <ul className="text-xs space-y-4 text-slate-700 font-medium">
                    <li className="flex justify-between border-b border-slate-200/50 pb-2"><span>Accidental Death</span> <span className="font-bold text-slate-900">$500,000</span></li>
                    <li className="flex justify-between border-b border-slate-200/50 pb-2"><span>Accidental Disability</span> <span className="font-bold text-slate-900">Up to $500,000</span></li>
                    <li className="flex justify-between border-b border-slate-200/50 pb-2"><span>Medical Expenses</span> <span className="font-bold text-slate-900">$20,000</span></li>
                    <li className="flex justify-between"><span>Hospital Allowance</span> <span className="font-bold text-slate-900">$100/day</span></li>
                  </ul>
                </div>
                <div className="px-1"><p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">Comprehensive coverage including high-risk occupation extension. Claims are processed directly via the WhatsApp portal.</p></div>
              </div>
            ) : (
              <>
                {isAgentSide && isActuallyAssisting && (
                  <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3 mb-2 animate-pulse text-indigo-800">
                    <PencilLine size={16} className="text-indigo-600" />
                    <p className="text-[10px] font-bold uppercase tracking-tighter">Collaborative Entry Mode</p>
                  </div>
                )}
                {formData.step === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h5 className="font-bold text-xs text-indigo-600 uppercase flex items-center gap-2"><Clock size={12}/> Profile Check</h5>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Insured Age</label><input type="number" value={formData.age} onChange={(e) => updateFormData('age', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#128C7E] outline-none shadow-sm font-semibold text-slate-800" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Exposure</label><select value={formData.hoursOnRoad} onChange={(e) => updateFormData('hoursOnRoad', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none shadow-sm font-semibold text-slate-800"><option>Standard</option><option>Commuter</option><option>On-Road</option></select></div>
                  </div>
                )}
                {formData.step === 2 && (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <h5 className="font-bold text-xs text-indigo-600 uppercase text-center flex items-center justify-center gap-2"><DollarSign size={12}/> Quotation</h5>
                    <div className="p-6 bg-green-50 rounded-3xl border-2 border-[#128C7E] text-center shadow-inner">
                      <div className="text-4xl font-black text-slate-800">${formData.premium}<span className="text-xs font-normal text-slate-400">/yr</span></div>
                      <p className="text-[9px] text-green-700 font-bold mt-2 uppercase">Verified Price</p>
                    </div>
                    <button onClick={() => setDetailsActive(true)} className="w-full py-2 flex items-center justify-center gap-1 text-[10px] font-bold text-[#128C7E] hover:underline">View Detail Provisions</button>
                  </div>
                )}
                {formData.step === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <h5 className="font-bold text-xs text-indigo-600 uppercase flex items-center gap-2"><User size={12}/> Legal Details</h5>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Legal Name</label><input value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} placeholder="Full Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm text-slate-800" /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ID Number</label><input value={formData.idNumber} onChange={(e) => updateFormData('idNumber', e.target.value)} placeholder="ID / Passport" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm shadow-sm text-slate-800" /></div>
                  </div>
                )}
                {formData.step === 4 && (
                  <div className="space-y-6 text-center animate-in zoom-in-95 duration-300 py-6">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner"><DollarSign size={32} /></div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm text-slate-800">
                      <div className="flex justify-between font-bold text-xs text-slate-400 mb-2 uppercase tracking-tight">Total Premium</div>
                      <div className="flex justify-between font-black text-2xl text-slate-800 pt-2 border-t border-slate-100"><span>Payable Now</span> <span>${formData.premium}.00</span></div>
                    </div>
                  </div>
                )}
                {formData.step === 5 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8 animate-in zoom-in-90 duration-500 text-slate-800">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-xl ring-8 ring-green-50"><CheckCircle2 size={40} /></div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Policy Active!</h2>
                    <p className="text-xs text-slate-500 px-6 font-medium">Policy has been registered. View or download your documents below.</p>
                    <div className="flex flex-col w-full gap-2 pt-4 px-4">
                       <button className="w-full py-3 bg-slate-100 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"><Eye size={16} /> View Digital Policy</button>
                       <button onClick={downloadPDF} className="w-full py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"><Download size={16} /> Download PDF</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-50 bg-white sticky bottom-0 z-10">
            {formData.step < 5 ? (
              <button 
                onClick={() => {
                   if (isDetailsActive) {
                      setDetailsActive(false);
                      if (formData.step === 0) setFormData(f => ({...f, step: 1}));
                   } else {
                      setFormData(f => ({...f, step: Math.min(f.step + 1, 5)}));
                   }
                }}
                className={`w-full py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all active:scale-95 ${isAgentSide ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-[#128C7E] hover:bg-[#075E54]'}`}
              >
                {isDetailsActive && formData.step === 0 ? "START APPLICATION" : isDetailsActive ? "BACK TO FLOW" : formData.step === 4 ? "CONFIRM & PAY" : formData.step === 0 ? "START APPLICATION" : "NEXT STEP"}
              </button>
            ) : (
              <button 
                onClick={() => { setFormData(f => ({...f, step: 0, isAgentAssisting: false})); setDetailsActive(false); handleSendMessage('customer', "Great, policy received! Thanks."); }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                DONE (BACK TO CHAT)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const hasUserReplied = (customerChats[activeCid] || []).some(m => m.sender === 'user');
  const showOccupationButtons = activeCid === 'c1' && !hasUserReplied && formData.step === 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8 font-sans overflow-auto text-slate-800 selection:bg-indigo-100">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-3"><Zap className="text-indigo-600 fill-indigo-600" size={28}/> WhatsApp Sales Copilot</h1>
        <p className="text-slate-500 mt-2 text-sm max-w-lg mx-auto font-medium">Strict Screen Isolation: Agent and Customer have independent UI shells.</p>
      </div>

      <div className="flex flex-wrap gap-12 items-start justify-center max-w-7xl w-full">
        {/* Customer Side View */}
        <div className="flex flex-col items-center gap-4 transition-all hover:scale-[1.01]">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-200 shadow-sm font-bold">Customer Mobile</span>
          <PhoneContainer title={AGENT_NAME} side="customer">
            {customerChats[activeCid]?.map(m => <MessageBubble key={m.id} msg={m} isAgentView={false} />)}
            
            {/* Live Card: ONLY if assisted AND details NOT open */}
            {formData.isAgentAssisting && formData.step > 0 && formData.step < 5 && !customerShowDetails && (
              <div className="self-start bg-white rounded-xl shadow-xl border-2 border-indigo-200 w-72 mb-4 p-4 animate-in slide-in-from-left duration-500 group text-slate-800">
                <div className="flex justify-between items-center mb-3"><div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase"><Zap size={14} className="animate-pulse fill-indigo-600" /> Live Assistant</div><span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">Step {formData.step}/5</span></div>
                <div className="space-y-2 mb-4"><div className="flex justify-between text-[10px] border-b pb-1 border-slate-50 text-slate-800"><span className="text-slate-400">Plan:</span><span className="font-bold">{formData.planName}</span></div><div className="flex justify-between text-[10px] border-b pb-1 border-slate-50 text-slate-800"><span className="text-slate-400">Premium:</span><span className="font-bold text-indigo-600">${formData.premium}.00</span></div></div>
                <button onClick={() => setFormData(f => ({...f, isAgentAssisting: false, step: formData.step || 1}))} className="w-full py-2 bg-[#128C7E] text-white rounded-lg font-bold text-[10px] uppercase shadow-md active:scale-95 transition-transform">Take Over UI</button>
              </div>
            )}

            {showOccupationButtons && (
              <div className="flex flex-col gap-2 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500"><button onClick={() => handleSendMessage('customer', "I am a delivery rider")} className="bg-white border-2 border-[#128C7E] text-[#128C7E] py-2.5 rounded-xl text-xs font-bold hover:bg-green-50 shadow-sm transition-all active:scale-95">I am a Delivery Rider</button><button onClick={() => handleSendMessage('customer', "I am an office worker")} className="bg-white border-2 border-slate-300 text-slate-500 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm transition-all active:scale-95">I am an Office Worker</button></div>
            )}

            {/* Customer instance of Flow Shell */}
            <WhatsAppFlow isAgentSide={false} isDetailsActive={customerShowDetails} setDetailsActive={setCustomerShowDetails} />
          </PhoneContainer>
        </div>

        {/* Agent Side View */}
        <div className="flex flex-col items-center gap-4 transition-all hover:scale-[1.01]">
          <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-700 shadow-md font-bold">Agent Mobile</span>
          <PhoneContainer title="Sales Copilot" side="agent" isAgent={true} subtitle={`Managing Lead: ${MOCK_CUSTOMERS.find(c => c.id === activeCid)?.name}`}>
            {formData.step > 0 && (
              <div className="mb-4 bg-white p-4 rounded-3xl shadow-lg border border-indigo-100 animate-in fade-in duration-300 relative overflow-hidden group text-slate-800">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-tighter"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>Live Monitoring</div><span className="text-[10px] text-slate-400 font-mono italic font-bold">Step {formData.step}/5</span></div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner"><div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${(formData.step / 5) * 100}%` }}></div></div>
                <div className="grid grid-cols-2 gap-2"><button onClick={() => setFormData(f => ({...f, isAgentAssisting: !f.isAgentAssisting, step: f.step || 1}))} className={`text-[9px] font-bold px-2 py-2.5 rounded-xl uppercase transition-all shadow-sm ${formData.isAgentAssisting ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>{formData.isAgentAssisting ? 'Stop Assist' : 'Assist Entry'}</button><button className="text-[9px] font-bold text-slate-400 px-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl uppercase text-slate-500">View Logs</button></div>
              </div>
            )}
            {copilotChats[activeCid]?.map(m => <MessageBubble key={m.id} msg={m} isAgentView={true} />)}
            
            {/* Agent instance of Flow Shell */}
            <WhatsAppFlow isAgentSide={true} isDetailsActive={agentShowDetails} setDetailsActive={setAgentShowDetails} />
          </PhoneContainer>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up { from { transform: translateY(100%); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        ::selection { background-color: rgba(79, 70, 229, 0.1); color: #4f46e5; }
      `}} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
