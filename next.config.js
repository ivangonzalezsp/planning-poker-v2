/** @type {import('next').NextConfig} */

const { i18n } = require('./next-i18n.config');

const nextConfig = {
  i18n,
  reactStrictMode: true,
}

module.exports = nextConfig
