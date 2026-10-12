export const NAV=[['#industries','Industries'],['#solutions','Solutions'],['#process','Process'],['#faq','FAQ']];
export const FLOW=[['New inquiry','Call, form or message'],['Instant reply','Sent automatically'],['Quote & follow-up','On a set schedule'],['Job booked','Tracked live']];
export const MARQUEE=['Lead capture','Live dashboards','Quote workflows','ERP reporting','Microsoft 365','Power BI','Power Automate','Document automation'];
export const INDUSTRIES=[
 ['Excavating contractors','Every call answered. More leads booked. Jobs costed.',[' AI voice agent answers calls 24/7',' Instant text-back for missed calls to capture and book leads','Automated follow-ups and faster estimates']],
 ['Machine shops','Accurate quotes. Controlled costs. Profitable jobs.',['RFQ intake & faster quoting','Live job costing to prevent cost overruns','Real-time production tracking & ERP reporting']]];
export const SOLUTIONS=[
 ['AI Voice Agents & Lead Capture','Every call answered. Every inquiry captured. More leads booked.'],['Missed-Call Recovery','Automatically text missed callers, follow up, and turn lost opportunities into booked jobs.'],
 ['Job Costing & Profitability','Compare estimated vs. actual costs, catch overruns early, and protect profit margins.'],['Workflow Automation','Automate repetitive tasks, quotes, approvals, and follow-ups.'],
 ['Live Dashboards','Track costs, production, inventory, and business performance in real time.'],['ERP Reporting & Integration','Get more from the systems you already use with automated reports and connected workflows.']];
export const STEPS=[['Review','30 minutes. One bottleneck.'],['Map','How work really flows.'],['Build','One workflow, shipped in weeks.'],['Run','Your team owns it.']];
export const FAQS=[['Is the review free?','Yes. 30 minutes, no obligation.'],['Do we need tech skills?','No. Your team runs it day to day.'],['How fast is a first result?','Weeks, not quarters.'],['We already have an ERP.','Good. We build on top of it.']];
export const QUESTIONS=[
 {id:'business',title:'What do you run?',type:'single',options:['Excavating / site-prep contractor','Machine shop','Both','Something else']},
 {id:'size',title:'How big is your team?',type:'single',options:['1–5','6–20','21–50','50+']},
 {id:'bottlenecks',title:'What slows you down most?',hint:'Pick up to 3',type:'multi',max:3,options:['Missed calls & slow lead follow-ups','Quoting jobs & estimating costs','Tracking job costs & profit margins','Scheduling, dispatch & production delays','Invoicing & manual data entry','Poor visibility into operations & reporting']},
 {id:'tracking',title:'How do you track jobs and operations today?',type:'single',options:['Paper, whiteboards & phone calls','Excel, Google Sheets & spreadsheets','ERP or industry-specific software','A mix of tools with no single source of truth']},
 {id:'tools',title:'Which tools do you use?',hint:'Select all that apply',type:'multi',options:['Microsoft 365','QuickBooks','Google Workspace','ERP / shop software','None yet']},
 {id:'timeline',title:'When do you want to start?',type:'single',options:['ASAP','Within 1–3 months','Just exploring']},
];
