import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import App from './App';
import { ThemeProvider, useTheme } from './theme';
import { LanguageProvider, useLanguage } from './i18n';
import './global.css';

function ThemedApp() {
  const { mode } = useTheme();
  const { lang } = useLanguage();

  return (
    <ConfigProvider
      locale={lang === 'en' ? enUS : zhCN}
      theme={{
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#ff6433',
          borderRadius: 0,
          fontFamily: '"Inter", "Helvetica Neue", "Helvetica", "Arial", "Segoe UI", system-ui, -apple-system, sans-serif, "PingFang SC", "Microsoft YaHei UI"',
          fontSize: 15,
          colorBgContainer: mode === 'dark' ? '#202329' : '#ffffff',
          colorBgLayout: mode === 'dark' ? '#17181c' : '#f5f7fa',
          colorText: mode === 'dark' ? '#fafaf8' : '#0a0a0a',
          colorTextSecondary: mode === 'dark' ? '#a8a8a8' : '#525252',
          colorBorder: mode === 'dark' ? '#30343d' : '#e0e0e0',
          colorBorderSecondary: mode === 'dark' ? '#30343d' : '#d4d4d2',
          wireframe: false,
        },
        components: {
          Layout: {
            siderBg: '#17181c',
            headerBg: mode === 'dark' ? '#17181c' : '#ffffff',
            headerHeight: 56,
            bodyBg: mode === 'dark' ? '#17181c' : '#f5f7fa',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(255, 100, 51, 0.18)',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.04)',
            darkItemColor: 'rgba(255, 255, 255, 0.65)',
            darkItemSelectedColor: '#ffffff',
            itemBorderRadius: 0,
            itemMarginInline: 0,
          },
          Card: {
            headerFontSize: 14,
            paddingLG: 24,
          },
          Table: {
            headerBg: mode === 'dark' ? '#202329' : '#ffffff',
            headerColor: mode === 'dark' ? '#a8a8a8' : '#525252',
            rowHoverBg: mode === 'dark' ? 'rgba(255, 100, 51, 0.15)' : 'rgba(255, 100, 51, 0.08)',
            borderColor: mode === 'dark' ? '#30343d' : '#e0e0e0',
          },
          Button: {
            borderRadius: 0,
            primaryShadow: 'none',
            defaultShadow: 'none',
          },
          Input: {
            borderRadius: 0,
            activeShadow: '0 0 0 2px rgba(0, 47, 167, 0.12)',
          },
          Select: {
            borderRadius: 0,
          },
          Tag: {
            borderRadiusSM: 0,
          },
          Progress: {
            defaultColor: mode === 'dark' ? '#5b7bff' : '#002fa7',
          },
        },
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ThemedApp />
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
