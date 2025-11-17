// Hash-based router for suppliers page
class SuppliersRouter {
  constructor() {
    this.listeners = [];
    this.currentRoute = null;
    this.currentParams = {};
    
    // Listen to hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }
  
  parseHash() {
    const hash = window.location.hash.slice(1) || '/suppliers';
    const [path, queryString] = hash.split('?');
    const params = {};
    
    // Parse query string
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) {
          params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      });
    }
    
    // Parse path: /suppliers or /suppliers/:id
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts[0] === 'suppliers') {
      return {
        view: pathParts[1] ? 'detail' : 'list',
        supplierId: pathParts[1] || null,
        params
      };
    }
    
    return { view: 'list', supplierId: null, params };
  }
  
  handleRoute() {
    const route = this.parseHash();
    this.currentRoute = route;
    this.currentParams = route.params;
    
    // Notify listeners
    this.listeners.forEach(fn => fn(route));
    
    // Log for analytics
    console.log('[SuppliersRouter] Route changed:', route);
  }
  
  navigate(view, supplierId = null, params = {}) {
    // Merge with current params
    const mergedParams = { ...this.currentParams, ...params };
    
    // Build hash
    let hash = '#/suppliers';
    if (view === 'detail' && supplierId) {
      hash += `/${supplierId}`;
    }
    
    // Add query params
    const queryParts = [];
    Object.keys(mergedParams).forEach(key => {
      if (mergedParams[key]) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(mergedParams[key])}`);
      }
    });
    if (queryParts.length > 0) {
      hash += '?' + queryParts.join('&');
    }
    
    window.location.hash = hash;
  }
  
  onRouteChange(fn) {
    this.listeners.push(fn);
    // Call immediately with current route
    if (this.currentRoute) {
      fn(this.currentRoute);
    }
  }
  
  getCurrentRoute() {
    return this.currentRoute || this.parseHash();
  }
  
  buildDeepLink(supplierId, params = {}) {
    const mergedParams = { ...this.currentParams, ...params };
    let url = `${window.location.origin}${window.location.pathname}#/suppliers/${supplierId}`;
    
    const queryParts = [];
    Object.keys(mergedParams).forEach(key => {
      if (mergedParams[key]) {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(mergedParams[key])}`);
      }
    });
    if (queryParts.length > 0) {
      url += '?' + queryParts.join('&');
    }
    
    return url;
  }
}

// Export singleton
if (typeof window !== 'undefined') {
  window.suppliersRouter = new SuppliersRouter();
}

