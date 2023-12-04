const imageApiUrl = 'http://localhost:31450';
const imageApiToken = 'da4ddc49a5dbe8d4b04da7d5cdf55c5f'
import createProxyMiddleware from 'http-proxy-middleware';

export default function(app){
  app.use('/image', createProxyMiddleware({
    target: imageApiUrl,
    changeOrigin: true,
    onProxyReq : (proxyReq, req, res) => {
      // add custom header to request
      proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
    }
  }));

  app.use('/images', createProxyMiddleware({
    target: imageApiUrl,
    changeOrigin: true,
    onProxyReq : (proxyReq, req, res) => {
      // add custom header to request
      proxyReq.setHeader('Authorization', `Bearer ${imageApiToken}`);
    }
  }));
}