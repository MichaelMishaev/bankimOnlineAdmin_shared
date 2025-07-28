/**
 * MenuDrill Component
 * Drill-down page showing detailed actions for a specific menu section
 * Based on MortgageDrill design structure
 * 
 * @version 1.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Pagination } from '../../components';
import '../MortgageDrill/MortgageDrill.css'; // Reuse drill styles

interface MenuAction {
  id: string;
  actionNumber: number;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  page_number: number;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
}

interface MenuDrillData {
  pageTitle: string;
  actionCount: number;
  lastModified: string;
  actions: MenuAction[];
}

const MenuDrill: React.FC = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [drillData, setDrillData] = useState<MenuDrillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 20; // Show more items per page to accommodate all menu content

  useEffect(() => {
    fetchDrillData();
  }, [sectionId]);

  const fetchDrillData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Fetching menu drill data for section ID: ${sectionId}`);
      
      // Use the backend drill endpoint for menu
      const drillResponse = await apiService.request(`/api/content/menu/drill/${sectionId}`, 'GET');
      
      if (drillResponse.success && drillResponse.data) {
        const { pageTitle, stepGroup, actionCount, actions } = drillResponse.data;

        // Transform to drill data format
        const transformedActions: MenuAction[] = actions.map((item: any) => ({
          id: item.id,
          actionNumber: item.actionNumber,
          content_key: item.content_key || '',
          component_type: item.component_type || 'text',
          category: item.category || '',
          screen_location: item.screen_location || '',
          page_number: item.page_number || 0,
          description: item.description || '',
          is_active: item.is_active !== false,
          translations: {
            ru: item.translations?.ru || '',
            he: item.translations?.he || '',
            en: item.translations?.en || ''
          },
          last_modified: item.last_modified || new Date().toISOString()
        }));

        setDrillData({
          pageTitle: pageTitle,
          actionCount: actionCount,
          lastModified: transformedActions.length > 0 ? 
            transformedActions.reduce((latest, action) => 
              new Date(action.last_modified) > new Date(latest) ? action.last_modified : latest, 
              transformedActions[0].last_modified
            ) : new Date().toISOString(),
          actions: transformedActions
        });
      } else {
        setError('Не удалось загрузить данные меню');
      }
    } catch (err) {
      console.error('❌ Error fetching menu drill data:', err);
      setError('Ошибка загрузки данных меню');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (action: MenuAction) => {
    console.log('🔍 Clicked menu action:', {
      id: action.id,
      component_type: action.component_type,
      content_key: action.content_key,
      description: action.description
    });
    
    // Get the component type display value to check
    const typeDisplay = getComponentTypeDisplay(action.component_type, action.content_key);
    console.log('📋 Type display:', typeDisplay);
    
    // Navigate based on component type
    const componentTypeLower = action.component_type?.toLowerCase();
    
    // For text types - navigate to edit page
    if (componentTypeLower === 'text' || 
        componentTypeLower === 'label' ||
        componentTypeLower === 'field_label' ||
        typeDisplay === 'Текст') {
      const textEditUrl = `/content/menu/text-edit/${action.id}`;
      console.log('✅ Navigating to menu text edit page:', textEditUrl);
      navigate(textEditUrl, { 
        state: { 
          fromPage: currentPage,
          searchTerm: searchTerm,
          returnPath: `/content/menu/drill/${sectionId}`
        } 
      });
    } 
    // For other types - navigate to standard edit page
    else {
      console.log('➡️ Navigating to standard edit page for type:', action.component_type);
      navigate(`/content/menu/edit/${action.id}`, { 
        state: { 
          fromPage: currentPage,
          searchTerm: searchTerm,
          returnPath: `/content/menu/drill/${sectionId}`
        } 
      });
    }
  };

  const handleBack = () => {
    navigate('/content/menu', { 
      state: { 
        fromPage: location.state?.fromPage || 1,
        searchTerm: location.state?.searchTerm || ''
      } 
    });
  };

  // First filter out options, then apply search
  const visibleActions = useMemo(() => {
    if (!drillData?.actions) return [];
    return drillData.actions.filter(action => {
      // Hide individual dropdown option values, only show dropdown headers
      if (action.component_type?.toLowerCase() === 'option') {
        return false;
      }
      return true;
    });
  }, [drillData?.actions]);

  const filteredActions = useMemo(() => {
    if (!visibleActions) return [];
    if (!searchTerm) return visibleActions;
    
    return visibleActions.filter(action => {
      return (
        action.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.component_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [visibleActions, searchTerm]);

  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActions = filteredActions.slice(startIndex, endIndex);

  const formatLastModified = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${date.toLocaleDateString('ru-RU')} | ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return '01.08.2023 | 12:03';
    }
  };

  const getComponentTypeDisplay = (componentType: string, contentKey: string = '') => {
    // Check if this is a dropdown-related field based on content patterns
    const isDropdownField = contentKey.includes('_option') || 
                            contentKey.includes('_ph') || 
                            contentKey.includes('menu_item');

    switch (componentType?.toLowerCase()) {
      case 'dropdown':
      case 'select':
        return 'Дропдаун';
      case 'option':
      case 'dropdown_option':
        return 'Дропдаун';
      case 'placeholder':
        return isDropdownField ? 'Дропдаун' : 'Текст';
      case 'label':
      case 'field_label':
        return isDropdownField ? 'Дропдаун' : 'Текст';
      case 'link':
      case 'button':
        return 'Ссылка';
      case 'text':
        return 'Текст';
      case 'help_text':
        return 'Справка';
      case 'header':
      case 'section_header':
        return 'Заголовок';
      case 'menu_item':
        return 'Пункт меню';
      default:
        return 'Текст';
    }
  };

  if (loading) {
    return (
      <div className="mortgage-drill-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных меню...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mortgage-drill-error">
        <p>Ошибка: {error}</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  if (!drillData) {
    return (
      <div className="mortgage-drill-error">
        <p>Данные не найдены</p>
        <button onClick={handleBack}>Вернуться назад</button>
      </div>
    );
  }

  return (
    <div className="mortgage-drill-page">
      {/* Main Content */}
      <div className="mortgage-drill-main">
        {/* Breadcrumb */}
        <div className="breadcrumb-container">
          <span className="breadcrumb-item" onClick={handleBack}>Контент сайта</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item" onClick={handleBack}>Меню</span>
          <div className="breadcrumb-separator"></div>
          <span className="breadcrumb-item active">{drillData.pageTitle}</span>
        </div>

        {/* Page Header */}
        <div className="page-header-row">
          <h1 className="page-title">{drillData.pageTitle}</h1>
        </div>

        {/* Info Cards */}
        <div className="info-cards-row">
          <div className="info-card">
            <span className="info-label">Количество действий</span>
            <span className="info-value">{visibleActions.length}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Последнее редактирование</span>
            <span className="info-value">{formatLastModified(drillData.lastModified)}</span>
          </div>
        </div>

        {/* Page Preview Section */}
        <div className="page-preview-section">
          <h2 className="section-title">Страница и ее состояния</h2>
          <div className="page-preview-container">
            <div className="page-preview-placeholder">
              <span>Предварительный просмотр {drillData.pageTitle.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Page State Thumbnails */}
        <div className="page-state-thumbnails">
          <div className="nav-thumbnail nav-prev">‹</div>
          <div className="state-thumbnail">1</div>
          <div className="state-thumbnail">2</div>
          <div className="state-thumbnail">3</div>
          <div className="state-thumbnail">4</div>
          <div className="state-thumbnail">5</div>
          <div className="state-thumbnail">6</div>
          <div className="nav-thumbnail nav-next">›</div>
        </div>

        {/* Actions List Title */}
        <h2 className="section-title">Список действий на странице</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Container following drill_1.md design */}
          <div style={{ width: '925px', background: 'var(--gray-800, #1F2A37)', boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10)', borderRadius: '8px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
            {/* Search Header */}
            <div style={{ alignSelf: 'stretch', padding: '16px', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
              <div style={{ width: '893px', height: '42px', position: 'relative' }}>
                <div style={{ width: '403px', height: '42px', left: '0px', top: '0px', position: 'absolute' }}>
                  <div style={{ width: '403px', height: '42px', left: '0px', top: '0px', position: 'absolute', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '8px', display: 'inline-flex' }}>
                    <div style={{ width: '403px', paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', background: 'var(--gray-700, #374151)', borderRadius: '8px', border: '1px var(--gray-600, #4B5563) solid', justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'inline-flex' }}>
                      <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: '10px', display: 'flex' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g id="magnifyingglass">
                            <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M10.6002 12.0498C9.49758 12.8568 8.13777 13.3333 6.66667 13.3333C2.98477 13.3333 0 10.3486 0 6.66667C0 2.98477 2.98477 0 6.66667 0C10.3486 0 13.3333 2.98477 13.3333 6.66667C13.3333 8.15637 12.8447 9.53194 12.019 10.6419C12.0265 10.6489 12.0338 10.656 12.0411 10.6633L15.5118 14.1339C15.7722 14.3943 15.7722 14.8164 15.5118 15.0768C15.2514 15.3372 14.8293 15.3372 14.5689 15.0768L11.0983 11.6061C11.0893 11.597 11.0805 11.5878 11.0718 11.5785C10.9133 11.4255 10.7619 11.2632 10.6181 11.0923C10.6121 11.0845 10.6062 11.0765 10.6002 11.0685V12.0498ZM11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z" fill="#9CA3AF"/>
                          </g>
                        </svg>
                        <input
                          type="text"
                          placeholder="Искать по названию, ID, номеру страницы"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--gray-400, #9CA3AF)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px', flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', left: '794px', top: '4px', position: 'absolute', background: 'var(--gray-800, #1F2A37)', borderRadius: '8px', border: '1px var(--gray-600, #4B5563) solid', justifyContent: 'center', alignItems: 'center', gap: '8px', display: 'inline-flex' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="funnel">
                      <path id="Union" fillRule="evenodd" clipRule="evenodd" d="M0.666504 3.46685C0.666504 1.71402 1.68758 0.333313 3.00755 0.333313H12.9922C14.3122 0.333313 15.3332 1.71402 15.3332 3.46685C15.3332 4.28415 14.9974 5.02664 14.4718 5.58069L10.6665 9.52712V12.8668C10.6665 13.3553 10.3781 13.7943 9.93136 13.9799L7.59803 14.9466C7.05307 15.1723 6.42474 14.9081 6.18612 14.3503C6.08565 14.1172 6.08565 13.8548 6.18612 13.6217V9.52712L2.52808 5.58069C2.00242 5.02664 1.6666 4.28415 1.6666 3.46685H0.666504ZM3.00755 2.33331C2.5767 2.33331 2.6666 2.95273 2.6666 3.46685C2.6666 3.66545 2.72946 3.88552 2.93685 4.10611L6.83975 8.23616C6.95236 8.35487 7.01385 8.5118 7.01163 8.67425L6.99994 13.4668L8.66658 12.7668V8.67425C8.66435 8.5118 8.72585 8.35487 8.83846 8.23616L12.5281 4.10611C12.7355 3.88552 12.9983 3.66545 12.9983 3.46685C12.9983 2.95273 13.423 2.33331 12.9922 2.33331H3.00755Z" fill="#F9FAFB"/>
                    </g>
                  </svg>
                  <div style={{ color: 'var(--gray-50, #F9FAFB)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '500', lineHeight: '18px' }}>Фильтры</div>
                </div>
              </div>
            </div>

            {/* Table Content - Column-based layout following drill_1.md */}
            <div className="drill-table-columns">
            {/* Column 1: НОМЕР ДЕЙСТВИЯ */}
            <div className="table-column" style={{ width: '149px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  НОМЕР ДЕЙСТВИЯ
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action, index) => (
                <React.Fragment key={`action-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--white, white)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '600', lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${action.page_number || (startIndex + index + 1)}.${action.description || action.translations.ru || action.content_key}`}>
                      {action.page_number || (startIndex + index + 1)}.{action.description || action.translations.ru || action.content_key}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 2: ТИП */}
            <div className="table-column" style={{ width: '126px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  ТИП
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`type-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--gray-300, #D1D5DB)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}>
                      {getComponentTypeDisplay(action.component_type, action.content_key)}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 3: ЯЗЫК */}
            <div className="table-column" style={{ width: '146px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  ЯЗЫК
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`lang-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--gray-300, #D1D5DB)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}>
                      {action.translations.ru ? 'Ru' : ''} {action.translations.he ? 'He' : ''} {action.translations.en ? 'En' : ''}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 4: ПОСЛЕДНЕЕ РЕДАКТИРОВАНИЕ */}
            <div className="table-column" style={{ width: '269px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  ПОСЛЕДНЕЕ РЕДАКТИРОВАНИЕ
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`modified-${action.id}`}>
                  <div className="column-cell">
                    <div style={{ flex: '1 1 0', color: 'var(--gray-300, #D1D5DB)', fontSize: '14px', fontFamily: 'Arimo', fontWeight: '400', lineHeight: '21px' }}>
                      {formatLastModified(action.last_modified)}
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>

            {/* Column 5: РЕДАКТИРОВАТЬ */}
            <div className="table-column" style={{ width: '161px' }}>
              <div className="column-header">
                <div style={{ color: 'var(--gray-400, #9CA3AF)', fontSize: '12px', fontFamily: 'Arimo', fontWeight: '600', textTransform: 'uppercase', lineHeight: '18px' }}>
                  РЕДАКТИРОВАТЬ
                </div>
              </div>
              <div className="column-divider"></div>
              {currentActions.map((action) => (
                <React.Fragment key={`edit-${action.id}`}>
                  <div className="column-cell">
                    <div 
                      className="edit-icon-button"
                      onClick={() => {
                        console.log('🚀 Arrow clicked for menu action:', action);
                        handleEditClick(action);
                      }}
                      title="Редактировать"
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'rgb(255, 255, 255)', backgroundColor: 'transparent', border: '1px solid rgb(55, 65, 81)', width: '40px', height: '40px', borderRadius: '4px' }}
                    >
                      →
                    </div>
                  </div>
                  <div className="column-divider"></div>
                </React.Fragment>
              ))}
            </div>
            </div>
          </div>

          {/* Modern UX-Friendly Pagination */}
          <div style={{ padding: '24px 16px' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredActions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDrill; 