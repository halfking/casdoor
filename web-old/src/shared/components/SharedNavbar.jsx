/**
 * SharedNavbar.jsx — React 版统一导航栏
 * 功能与 SharedNavbar.vue 完全一致
 *
 * 使用方式：
 *   <SharedNavbar
 *     appName="认证中心"
 *     appLinks={[{ label: '设置', href: '/settings' }]}
 *     isAuthenticated={!!token}
 *     authToken={token}
 *     onLogin={handleLogin}
 *     onLogout={handleLogout}
 *   />
 */
/* eslint-disable */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as authService from '../auth/auth-service.js';
import {
  getPortalNavCompact,
  getPortalNavLinks,
  getUnifiedProductEntries,
  getUnifiedProductEntryGroups,
  resolvePortalLoginUrl,
  resolveProductLaunchUrl,
  resolveServiceUrl,
} from '../navigation/unified-links.js';
import './SharedNavbar.css';

const MAX_TOTAL_LINKS = 8;
const PRODUCT_MENU_CLOSE_DELAY_MS = 220;

export default function SharedNavbar({
  appName,
  appLinks = [],
  isAuthenticated = false,
  authToken = null,
  hidePortalNav = false,
  onLogin,
  onLogout,
}) {
  const [theme, setTheme] = useState(() => authService.getPreferredTheme());
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [navConfig, setNavConfig] = useState(() => authService.getCustomNavConfig());
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Derived
  const hasLoginListener = typeof onLogin === 'function';

  const portalLinks = useMemo(() => {
    if (hidePortalNav) return [];
    const totalLinks = appLinks.length + (isAuthenticated ? 4 : 1);
    return totalLinks > MAX_TOTAL_LINKS ? getPortalNavCompact() : getPortalNavLinks();
  }, [hidePortalNav, appLinks.length, isAuthenticated]);

  const productEntries = useMemo(() => getUnifiedProductEntries(), []);
  const groupedProductEntries = useMemo(() => getUnifiedProductEntryGroups(), []);

  const recentVisibleProducts = useMemo(() => {
    return recentProducts
      .map((recent) => ({
        recent,
        product: productEntries.find((entry) => entry.id === recent.key),
      }))
      .filter((item) => Boolean(item.product));
  }, [recentProducts, productEntries]);

  const themeLabel = theme === 'dark' ? '切换到浅色' : '切换到暗色';

  // Helpers
  const normalizePath = (value) => value.replace(/\/+$/, '') || '/';

  const isNavLinkActive = useCallback(
    (href) => {
      try {
        const current = new URL(window.location.href);
        const target = new URL(href, window.location.origin);
        if (current.origin !== target.origin) return false;
        if (normalizePath(current.pathname) !== normalizePath(target.pathname)) return false;
        if (target.hash) return current.hash === target.hash;
        if (target.search) return current.search === target.search;
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  const getProductHref = useCallback(
    (product) => {
      return (
        resolveProductLaunchUrl(product.id || '', product.href, undefined, authToken) || product.href
      );
    },
    [authToken],
  );

  // Handlers
  const handleThemeToggle = () => {
    setTheme(authService.togglePreferredTheme());
  };

  const handleLoginClick = () => {
    if (hasLoginListener) {
      onLogin();
    } else {
      window.location.href = resolvePortalLoginUrl();
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openProductMenu = () => {
    clearCloseTimer();
    setProductMenuOpen(true);
  };

  const toggleProductMenu = () => {
    clearCloseTimer();
    setProductMenuOpen((v) => !v);
  };

  const scheduleProductMenuClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setProductMenuOpen(false);
      closeTimerRef.current = null;
    }, PRODUCT_MENU_CLOSE_DELAY_MS);
  };

  const handleProductClick = (product) => {
    if (product.id) {
      authService.recordProductAccess(product.id, product.label);
    }
    clearCloseTimer();
    setProductMenuOpen(false);
  };

  // Effects
  useEffect(() => {
    const stopThemeSync = authService.setupThemeSync((nextTheme) => {
      setTheme(nextTheme);
    });

    if (isAuthenticated) {
      setRecentProducts(authService.getRecentProducts());
      setNavConfig(authService.getCustomNavConfig());
    }

    const stopAuthEvent = authService.onAuthEvent((event) => {
      if (event.type === 'recent_products_updated') {
        setRecentProducts(Array.isArray(event.data) ? event.data : []);
      }
      if (event.type === 'custom_nav_updated') {
        setNavConfig(authService.getCustomNavConfig());
      }
    });

    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        clearCloseTimer();
        setProductMenuOpen(false);
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        clearCloseTimer();
        setProductMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      stopThemeSync();
      stopAuthEvent();
      clearCloseTimer();
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAuthenticated]);

  return (
    <header className="kx-shared-navbar">
      <nav className="kx-shared-navbar__container">
        {/* Logo */}
        <a className="kx-shared-navbar__logo" href={resolveServiceUrl('portal')}>
          <img src="/kxmemory-icon.svg" alt="开轩启圭" className="kx-shared-navbar__logo-icon" />
          <div className="kx-shared-navbar__logo-text">
            <strong>开轩启圭{appName ? ` · ${appName}` : ' 数字智能'}</strong>
          </div>
        </a>

        {/* Mobile toggle */}
        <button
          type="button"
          className="kx-shared-navbar__mobile-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label="切换导航菜单"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Links */}
        <div
          className={[
            'kx-shared-navbar__links',
            mobileMenuOpen && 'kx-shared-navbar__links--mobile-open',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {/* App links */}
          {appLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={[
                'kx-shared-navbar__link',
                link.highlight && 'kx-shared-navbar__link--highlight',
                isNavLinkActive(link.href) && 'kx-shared-navbar__link--active',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isNavLinkActive(link.href) ? 'page' : undefined}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}

          {appLinks.length > 0 && portalLinks.length > 0 && (
            <span className="kx-shared-navbar__divider" aria-hidden="true" />
          )}

          {/* Portal links */}
          {portalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={[
                'kx-shared-navbar__link',
                'kx-shared-navbar__link--portal',
                isNavLinkActive(link.href) && 'kx-shared-navbar__link--active',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isNavLinkActive(link.href) ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}

          {/* Product dropdown */}
          <div
            ref={dropdownRef}
            className="kx-shared-navbar__dropdown"
            onMouseEnter={openProductMenu}
            onMouseLeave={scheduleProductMenuClose}
            onFocus={openProductMenu}
          >
            <button
              type="button"
              className="kx-shared-navbar__btn-link kx-shared-navbar__btn-link--dropdown"
              aria-haspopup="true"
              aria-expanded={productMenuOpen}
              aria-label="打开产品导航"
              onClick={toggleProductMenu}
            >
              <span className="kx-shared-navbar__dropdown-trigger-label">产品</span>
              <span
                className={[
                  'kx-shared-navbar__dropdown-arrow',
                  productMenuOpen && 'is-open',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                ▼
              </span>
            </button>

            <div
              className={[
                'kx-shared-navbar__dropdown-menu',
                productMenuOpen && 'kx-shared-navbar__dropdown-menu--open',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Recent products */}
              {isAuthenticated &&
                navConfig.showRecent &&
                recentVisibleProducts.length > 0 && (
                  <>
                    <div className="kx-shared-navbar__dropdown-section">
                      <div className="kx-shared-navbar__dropdown-section-title">最近使用</div>
                    </div>
                    {recentVisibleProducts.map((item) => (
                      <a
                        key={`recent-${item.recent.key}`}
                        href={getProductHref(item.product)}
                        className="kx-shared-navbar__dropdown-item kx-shared-navbar__dropdown-item--recent"
                        target={item.product.external ? '_blank' : undefined}
                        rel={item.product.external ? 'noopener noreferrer' : undefined}
                        onClick={() => handleProductClick(item.product)}
                      >
                        <span className="kx-shared-navbar__dropdown-item-icon" aria-hidden="true">
                          {item.product.icon}
                        </span>
                        <span className="kx-shared-navbar__dropdown-item-label">
                          {item.product.label}
                        </span>
                      </a>
                    ))}
                    <div className="kx-shared-navbar__dropdown-divider" />
                  </>
                )}

              {/* Grouped products */}
              {groupedProductEntries.map((group) => (
                <React.Fragment key={group.groupLabel || 'default'}>
                  {group.groupLabel && (
                    <div className="kx-shared-navbar__dropdown-section">
                      <div className="kx-shared-navbar__dropdown-section-title">
                        {group.groupLabel}
                      </div>
                    </div>
                  )}
                  {group.items.map((product) => (
                    <a
                      key={product.id}
                      href={getProductHref(product)}
                      className="kx-shared-navbar__dropdown-item"
                      target={product.external ? '_blank' : undefined}
                      rel={product.external ? 'noopener noreferrer' : undefined}
                      onClick={() => handleProductClick(product)}
                    >
                      <span className="kx-shared-navbar__dropdown-item-icon" aria-hidden="true">
                        {product.icon}
                      </span>
                      <span className="kx-shared-navbar__dropdown-item-label">{product.label}</span>
                    </a>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Theme toggle */}
          <button
            type="button"
            className="kx-shared-navbar__btn-link kx-shared-navbar__theme-toggle"
            aria-label={themeLabel}
            title={themeLabel}
            onClick={handleThemeToggle}
          >
            <span className="kx-shared-navbar__theme-toggle-label">
              {theme === 'dark' ? '浅色' : '暗色'}
            </span>
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <button
              type="button"
              className="kx-shared-navbar__btn-link kx-shared-navbar__btn-link--danger"
              onClick={onLogout}
            >
              退出
            </button>
          ) : (
            <button
              type="button"
              className="kx-shared-navbar__link kx-shared-navbar__link--highlight kx-shared-navbar__login-btn"
              onClick={handleLoginClick}
            >
              登录
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
