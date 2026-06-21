(function(){
  const config = window.AE_BACKEND_CONFIG || {};
  const apiBaseUrl = String(config.apiBaseUrl || '').replace(/\/$/, '');
  const sameOriginApi = window.location && /^https?:$/.test(window.location.protocol) ? window.location.origin : '';
  const hasKeys = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const hasClient = Boolean(window.supabase && hasKeys);
  const client = hasClient ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  function isReady(){
    return Boolean(client || apiBaseUrl || sameOriginApi);
  }

  function logBackendIssue(table, error){
    if(error) console.warn(`A.E CONNECT backend issue in ${table}:`, error.message || error);
  }

  function cleanText(value){
    return String(value || '').trim();
  }

  function formatTime(createdAt){
    if(!createdAt) return 'Just now';
    const created = new Date(createdAt);
    if(Number.isNaN(created.getTime())) return 'Just now';
    const diff = Math.max(0, Date.now() - created.getTime());
    const minutes = Math.floor(diff / 60000);
    if(minutes < 1) return 'Just now';
    if(minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if(hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  async function listRows(table){
    const apiRows = await apiRequest(`/api/${table}`);
    if(apiRows) return apiRows;
    if(!client) return null;
    const { data, error } = await client.from(table).select('*').order('created_at', { ascending: false });
    if(error){
      logBackendIssue(table, error);
      return null;
    }
    return data || [];
  }

  async function insertRow(table, payload){
    const apiRow = await apiRequest(`/api/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if(apiRow) return apiRow;
    if(!client) return null;
    const { data, error } = await client.from(table).insert(payload).select().single();
    if(error){
      logBackendIssue(table, error);
      return null;
    }
    return data;
  }

  async function apiRequest(path, options){
    const base = apiBaseUrl || sameOriginApi;
    if(!base) return null;
    try{
      const response = await fetch(`${base}${path}`, options);
      if(!response.ok) return null;
      return await response.json();
    }catch(error){
      return null;
    }
  }

  function listingFromRow(row){
    return {
      id: row.id,
      category: row.category,
      product: row.product,
      seller: row.seller,
      business: row.business,
      location: row.location,
      phone: row.phone,
      email: row.email,
      price: row.price,
      description: row.description,
      custom: true,
      backend: true
    };
  }

  function discussionFromRow(row){
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      details: row.details,
      name: row.name,
      time: formatTime(row.created_at),
      backend: true
    };
  }

  function partnerFromRow(row){
    return {
      id: row.id,
      name: row.name,
      idea: row.idea,
      skills: row.skills,
      needs: row.needs,
      contact: row.contact,
      time: formatTime(row.created_at),
      backend: true
    };
  }

  function groupFromRow(row){
    return {
      id: row.id,
      title: row.title,
      topic: row.topic,
      text: row.text,
      features: row.features,
      picture: row.picture || '',
      custom: true,
      backend: true
    };
  }

  function messageFromRow(row){
    return {
      id: row.id,
      from: row.sender,
      text: row.body || row.attachment_name || '',
      mine: false,
      type: row.message_type || 'text',
      duration: row.duration || '',
      time: formatTime(row.created_at),
      backend: true
    };
  }

  window.AEBackend = {
    isReady,
    formatTime,
    async createAccount(account){
      const saved = await apiRequest('/api/accounts/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account)
      });
      return saved || null;
    },
    async loginAccount(credentials){
      const saved = await apiRequest('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return saved || null;
    },
    async listMarketplaceListings(){
      const rows = await listRows('marketplace_listings');
      return rows ? rows.map(listingFromRow) : null;
    },
    async createMarketplaceListing(item){
      const row = await insertRow('marketplace_listings', {
        category: cleanText(item.category),
        product: cleanText(item.product),
        seller: cleanText(item.seller),
        business: cleanText(item.business),
        location: cleanText(item.location),
        phone: cleanText(item.phone),
        email: cleanText(item.email),
        price: cleanText(item.price),
        description: cleanText(item.description)
      });
      return row ? listingFromRow(row) : null;
    },
    async listPartnerProfiles(){
      const rows = await listRows('partner_profiles');
      return rows ? rows.map(partnerFromRow) : null;
    },
    async createPartnerProfile(item){
      const row = await insertRow('partner_profiles', {
        name: cleanText(item.name),
        idea: cleanText(item.idea),
        skills: cleanText(item.skills),
        needs: cleanText(item.needs),
        contact: cleanText(item.contact)
      });
      return row ? partnerFromRow(row) : null;
    },
    async listBusinessDiscussions(){
      const rows = await listRows('business_discussions');
      return rows ? rows.map(discussionFromRow) : null;
    },
    async createBusinessDiscussion(item){
      const row = await insertRow('business_discussions', {
        title: cleanText(item.title),
        category: cleanText(item.category),
        details: cleanText(item.details),
        name: cleanText(item.name)
      });
      return row ? discussionFromRow(row) : null;
    },
    async listCommunityGroups(){
      const rows = await listRows('community_groups');
      return rows ? rows.map(groupFromRow) : null;
    },
    async createCommunityGroup(group){
      const row = await insertRow('community_groups', {
        id: cleanText(group.id),
        title: cleanText(group.title),
        topic: cleanText(group.topic),
        text: cleanText(group.text),
        features: cleanText(group.features),
        picture: group.picture || null
      });
      return row ? groupFromRow(row) : null;
    },
    async listGroupMessages(groupId){
      const apiRows = await apiRequest(`/api/group_messages?group_id=${encodeURIComponent(groupId)}`);
      if(apiRows) return apiRows.map(messageFromRow);
      if(!client) return null;
      const { data, error } = await client
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });
      if(error){
        logBackendIssue('group_messages', error);
        return null;
      }
      return (data || []).map(messageFromRow);
    },
    async createGroupMessage(groupId, message){
      const row = await insertRow('group_messages', {
        group_id: cleanText(groupId),
        sender: cleanText(message.from || 'Member'),
        body: cleanText(message.text),
        message_type: cleanText(message.type || 'text'),
        duration: cleanText(message.duration),
        attachment_name: message.type === 'file' ? cleanText(message.text) : null
      });
      return row ? messageFromRow(row) : null;
    }
  };
})();
