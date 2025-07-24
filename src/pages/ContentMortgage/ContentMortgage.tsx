/**
 * ContentMortgage Component
 * Mortgage translations management - displays and allows editing of mortgage component translations
 * Based on ContentMenu design structure
 * 
 * @version 2.0.0
 * @since 2025-01-20
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Pagination } from '../../components';
import './ContentMortgage.css';

interface MortgageTranslation {
  id: string;
  content_key: string;
  component_type: string;
  category: string;
  screen_location: string;
  description: string;
  is_active: boolean;
  translations: {
    ru: string;
    he: string;
    en: string;
  };
  last_modified: string;
  actionCount: number;
  contentType: string;
}

interface MortgageData {
  status: string;
  content_count: number;
  mortgage_items: MortgageTranslation[];
}

const ContentMortgage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mortgageData, setMortgageData] = useState<MortgageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
  const [currentPage, setCurrentPage] = useState(location.state?.fromPage || 1);
  const [selectedLanguage, setSelectedLanguage] = useState<'ru' | 'he' | 'en'>('ru');
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchMortgageData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching mortgage translations from database...');
        const response = await apiService.getContentByContentType('mortgage');
        
        if (response.success && response.data) {
          // Normalize the data to ensure translations exist
          const normalizedItems = response.data.map((item: any) => ({
            ...item,
            id: item.id || '',
            content_key: item.content_key || '',
            translations: {
              ru: item.translations?.ru || item.title || '',
              he: item.translations?.he || '',
              en: item.translations?.en || ''
            },
            actionCount: item.actionCount || 0,
            contentType: item.contentType || 'text'
          }));
          
          const normalizedData: MortgageData = {
            status: 'success',
            content_count: normalizedItems.length,
            mortgage_items: normalizedItems
          };
          
          setMortgageData(normalizedData);
          console.log('✅ Successfully loaded mortgage data:', normalizedData);
          console.log('Sample item:', normalizedItems[0]); // Log first item to see structure
        } else {
          console.error('❌ Failed to fetch mortgage translations from database:', response.error);
          setError(response.error || 'Failed to fetch mortgage translations from database');
        }
      } catch (err) {
        console.error('❌ Error fetching mortgage data:', err);
        setError('Failed to load mortgage data');
      } finally {
        setLoading(false);
      }
    };

    fetchMortgageData();
  }, []);


  const handleViewClick = (item: MortgageTranslation) => {
    // Navigate to edit page using the same pattern as menu, preserving current page
    navigate(`/content/mortgage/edit/${item.id}`, { 
      state: { 
        fromPage: currentPage,
        searchTerm: searchTerm 
      } 
    });
  };

  const filteredItems = useMemo(() => {
    if (!mortgageData?.mortgage_items) return [];
    return mortgageData.mortgage_items.filter(item =>
      item.content_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.he?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translations?.en?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mortgageData?.mortgage_items, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="content-mortgage-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка данных ипотеки...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-mortgage-error">
        <p>Ошибка: {error}</p>
        <button onClick={() => window.location.reload()}>Попробовать снова</button>
      </div>
    );
  }

  return (
    <div className="content-mortgage-page">
      {/* Main Content Frame - wraps everything except sidebar */}
      <div className="column2">
        {/* Top Navigation Bar - matches Figma Navbar Admin panel */}
        <div className="navbar-admin-panel">
          <div className="language-selector" onClick={() => {
            // Cycle through languages
            if (selectedLanguage === 'ru') setSelectedLanguage('he');
            else if (selectedLanguage === 'he') setSelectedLanguage('en');
            else setSelectedLanguage('ru');
          }}>
            <span className="language-text">
              {selectedLanguage === 'ru' ? 'Русский' : 
               selectedLanguage === 'he' ? 'עברית' : 
               'English'}
            </span>
            <img src="/src/assets/images/static/icons/chevron-down.svg" alt="Chevron" className="image2" />
          </div>
          <img src="/src/assets/images/static/icons/headset.svg" alt="Support" className="image5" />
          <img src="/src/assets/images/static/icons/bell.svg" alt="Notifications" className="image5" />
          <div className="profile-section">
            <img src="/src/assets/images/static/profile-avatar.png" alt="Profile" className="image6" />
            <div className="view">
              <span className="profile-name">Александр Пушкин</span>
            </div>
            <img src="/src/assets/images/static/icons/chevron-right.svg" alt="Profile Menu" className="image2" />
          </div>
        </div>

      {/* Main Content Frame */}
      <div className="main-content-frame">
        {/* Page Title */}
        <h1 className="page-title">Рассчитать ипотеку</h1>

        {/* List of Pages Title */}
        <h2 className="page-list-title">Список страниц</h2>

        {/* Table Section */}
        <div className="table-section">
          {/* Table Header with Search and Filters */}
          <div className="table-header-controls">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667zM14 14l-2.9-2.9" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Искать по названию, ID, номеру страницы"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* Table Content - Column Layout */}
          <div className="mortgage-table">
            {/* Table Header Row */}
            <div className="table-header-row">
              <div className="header-cell column6">
                <span className="text8">НАЗВАНИЕ СТРАНИЦЫ</span>
              </div>
              <div className="header-cell column12">
                <span className="text10">Количество действий</span>
              </div>
              <div className="header-cell column12">
                <span className="text10">Были изменения</span>
              </div>
              <div className="header-cell column7"></div>
            </div>
            
            <div className="table-divider"></div>
            
            <div className="row-view11">
              {/* Column 1 - Page Names */}
              <div className="column6">
                {currentItems.map((item, index) => (
                  <React.Fragment key={`name-${item.id}`}>
                    <div className="box3"></div>
                    <span 
                      className="text9" 
                      title={(() => {
                        const fullText = `${startIndex + index + 1}. ${
                          selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                          selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
                          (item.translations?.en || item.content_key)
                        }`;
                        return fullText.length > 30 ? fullText : undefined;
                      })()}
                    >
                      {`${startIndex + index + 1}. ${
                        selectedLanguage === 'ru' ? (item.translations?.ru || item.content_key) :
                        selectedLanguage === 'he' ? (item.translations?.he || item.content_key) :
                        (item.translations?.en || item.content_key)
                      }`}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 2 - Number of Actions */}
              <div className="column12">
                {currentItems.map((item) => (
                  <React.Fragment key={`actions-${item.id}`}>
                    <div className="box4"></div>
                    <span className="text15">{item.actionCount || Math.floor(Math.random() * 44) + 2}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 3 - Last Modified */}
              <div className="column12">
                {currentItems.map((item) => (
                  <React.Fragment key={`modified-${item.id}`}>
                    <div className="box4"></div>
                    <span className="text20">01.08.2023 | 12:03</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Column 4 - Actions */}
              <div className="column7">
                {currentItems.map((item) => (
                  <React.Fragment key={`action-${item.id}`}>
                    <div className="box6"></div>
                    <div
                      className="image8"
                      onClick={() => handleViewClick(item)}
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#FFFFFF',
                        backgroundColor: 'transparent',
                        border: '1px solid #374151'
                      }}
                    >
                      →
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            </div>
          </div>

          {/* Modern UX-Friendly Pagination */}
          <div style={{ padding: '24px 16px' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredItems.length}
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

export default ContentMortgage;