/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains:['res.cloudinary.com', 'localhost', 'tabac-app.vercel.app', 'tabac-app.vercel.app'],
    },
    reactStrictMode: true
};

module.exports = nextConfig;
