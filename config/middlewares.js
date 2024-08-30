module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            'cdn.jsdelivr.net',
            'strapi.io',
            's3.amazonaws.com',
            'market-assets.strapi.io',
            `${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com',
            `${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
          ],
          upgradeInsecureRequests: null,
          'script-src': [
            "'self'",
            'editor.unlayer.com',
            'editor.unlayer.com/embed.js',
          ],
          'frame-src': ["'self'", 'editor.unlayer.com'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      jsonLimit: '100mb',
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
]
