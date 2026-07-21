(function(){
  const map = Object.create(null);
  const image = (url, label, icon) => Object.freeze({ type:'image', url, label, icon });
  const illustration = (label, icon, theme) => Object.freeze({ type:'illustration', label, icon, theme });
  const assign = (titles, visual) => titles.forEach(title => { map[title.toUpperCase()] = visual; });

  assign(['LEADERSHIP','TEAM LEADERSHIP','CURRICULUM LEADERSHIP'], image('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=82','Team leader presenting and collaborating','LD'));
  assign(['OPERATIONS MANAGEMENT','OPERATIONS PLANNING','LEAN OPERATIONS','PRODUCTION MANAGEMENT','MANUFACTURING PROCESSES'], image('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=82','Professional operations and production environment','OP'));
  assign(['STRATEGIC MANAGEMENT','STRATEGIC PLANNING','BUSINESS PLANNING','BUSINESS MODEL CANVAS','PRODUCT STRATEGY','GO-TO-MARKET STRATEGY'], image('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=82','Executive strategy planning workshop','ST'));
  assign(['CHANGE MANAGEMENT','ORGANIZATIONAL DEVELOPMENT','BUSINESS PROCESS IMPROVEMENT','PROCESS MODELLING','VALUE CHAIN ANALYSIS'], image('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=82','Business transformation and workflow planning','CM'));
  assign(['TEAM MANAGEMENT','TEAMWORK','STAFF SUPERVISION','STAFF DEVELOPMENT','EMPLOYEE RELATIONS','TALENT MANAGEMENT'], image('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=82','Professional team collaboration','TM'));
  assign(['PROJECT MANAGEMENT','IT PROJECT MANAGEMENT','PROJECT PLANNING','PROJECT SCHEDULING','AGILE METHODS'], image('https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1000&q=82','Kanban project management board','PM'));

  assign(['ARCGIS PRO'], illustration('ArcGIS Pro mapping workspace','GIS','map'));
  assign(['QGIS'], illustration('QGIS open-source mapping workspace','QGIS','map'));
  assign(['GIS','GIS MAPPING','GIS FOR DEVELOPMENT','GIS FOR ECOLOGY','GIS FOR FISHERIES','GIS FOR HEALTH','SPATIAL DATA ANALYSIS','CARTOGRAPHY','CARTOGRAPHY & MAP DESIGN','FIELD MAPPING','CRIME MAPPING'], illustration('Geographic information and map analysis','GIS','map'));
  assign(['REMOTE SENSING','SATELLITE DATA','GOOGLE EARTH ENGINE','IMAGE INTERPRETATION'], image('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1000&q=82','Satellite imagery and Earth observation','RS'));
  assign(['GPS','GPS & FIELD SURVEYING','FIELD SURVEYING','LAND SURVEYING','CADASTRAL SURVEYING','MINE SURVEYING','GEODESY','HYDROGRAPHY'], image('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=82','Professional land surveying and positioning','GPS'));
  assign(['DRONE MAPPING'], image('https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1000&q=82','Drone surveying a landscape','DR'));

  assign(['PYTHON','PYTHON FOR ECONOMICS','PYTHON FOR FINANCE','PYTHON FOR GIS','PYTHON FOR PHYSICS','PYTHON SCRIPTING','GIS PROGRAMMING (PYTHON FOR GIS)'], image('https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1000&q=82','Python code editor and programming','PY'));
  assign(['R PROGRAMMING','C PROGRAMMING','JAVA','JAVASCRIPT','WEB DEVELOPMENT','API DEVELOPMENT','API INTEGRATION','MOBILE APP DEVELOPMENT','SOFTWARE DESIGN'], image('https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=82','Professional software code editor','</>'));
  assign(['POWER BI','TABLEAU','DASHBOARD DESIGN','DATA VISUALIZATION','GOOGLE ANALYTICS','HR ANALYTICS','SUPPLY CHAIN ANALYTICS','BIG DATA ANALYTICS'], image('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=82','Analytics dashboard visualization','BI'));
  assign(['EXCEL','MICROSOFT EXCEL','FINANCIAL REPORTING','BUDGETING','FARM RECORD KEEPING','RECORD KEEPING'], illustration('Professional spreadsheet workspace','XLS','spreadsheet'));
  assign(['SQL','DATABASES','DATABASE DESIGN','DATABASE MANAGEMENT','DATA MANAGEMENT','DATA ENGINEERING'], illustration('Structured database and query workspace','SQL','data'));
  assign(['MACHINE LEARNING','DEEP LEARNING','SCIKIT-LEARN','COMPUTER VISION','NATURAL LANGUAGE PROCESSING','NATURAL LANGUAGE PROCESSING BASICS','NLP','MLOPS','MODEL DEPLOYMENT','MODEL EVALUATION','FEATURE ENGINEERING'], image('https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=1000&q=82','Artificial intelligence and machine learning visualization','AI'));

  assign(['MARKETING','DIGITAL MARKETING','MARKETING AUTOMATION','MARKETING RESEARCH','AGRICULTURAL MARKETING','DESTINATION MARKETING','HOSPITALITY MARKETING','SOCIAL MEDIA MARKETING','SPORTS MARKETING','CONTENT MARKETING','EMAIL MARKETING','DIGITAL ADS','PAID ADS','CAMPAIGN MANAGEMENT'], image('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=82','Digital marketing analytics dashboard','MK'));
  assign(['FINANCE','FINANCIAL MODELLING','FINANCIAL FORECASTING','FINANCIAL PLANNING','FINANCIAL MATHEMATICS','INVESTMENT ANALYSIS','REAL ESTATE FINANCE','PROJECT FINANCE','STARTUP FINANCE','GREEN FINANCE','PUBLIC FINANCIAL MANAGEMENT'], image('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=82','Financial market charts and analysis','FN'));
  assign(['ECONOMETRICS','ECONOMIC FORECASTING','STATISTICAL ANALYSIS','STATISTICAL MODELLING','STATISTICS','BIOSTATISTICS','MEDICAL STATISTICS','STATA','SPSS','ACTUARIAL MODELLING'], image('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=82','Statistical graphs and quantitative analysis','Σ'));
  assign(['POLICY ANALYSIS','PUBLIC POLICY','PUBLIC POLICY ANALYSIS','POLICY WRITING','POLICY BRIEF WRITING','POLICY DESIGN','FOREIGN POLICY ANALYSIS','HEALTH POLICY ANALYSIS','AGRICULTURAL POLICY','EDUCATION POLICY','ENERGY POLICY','ENVIRONMENTAL POLICY','LAND POLICY','PLANNING POLICY','SOCIAL POLICY'], image('https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=82','Government policy and public institutions','PL'));
  assign(['PUBLIC SPEAKING','PRESENTATION SKILLS','CLIENT PRESENTATION','DEBATE','VOICE TRAINING'], image('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1000&q=82','Professional public presentation','PS'));
  assign(['RESEARCH METHODS','QUALITATIVE RESEARCH','ACADEMIC WRITING','SCIENTIFIC WRITING','REPORT WRITING','TECHNICAL REPORTING','GRANT WRITING','LEGAL RESEARCH','ARCHIVAL RESEARCH','MEDICAL RESEARCH'], image('https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1000&q=82','Professional research and academic study','RE'));
  assign(['AUTOCAD','AUTOCAD ELECTRICAL','CIVIL 3D','ARCHITECTURAL DRAFTING','TECHNICAL DRAWING','REVIT','BIM','SKETCHUP','SOLIDWORKS'], image('https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1000&q=82','Technical design and construction planning','CAD'));
  assign(['GRAPHIC DESIGN','ADOBE ILLUSTRATOR','ADOBE PHOTOSHOP','FIGMA','UI DESIGN','UI DESIGN BASICS','WEB DESIGN','LAYOUT DESIGN','PRINT DESIGN','TYPOGRAPHY','DESIGN SYSTEMS'], image('https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=82','Professional digital design workspace','UX'));

  window.AE_SKILL_IMAGE_MAP = Object.freeze(map);
  window.AE_SKILL_IMAGE_FALLBACK = Object.freeze({
    type:'illustration',
    label:'Professional skill learning module',
    icon:'AE',
    theme:'neutral'
  });
})();
