import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  FiPlus, FiEdit3, FiTrash2, FiEye, FiSearch, FiFilter, FiRefreshCw,
  FiPackage, FiDollarSign, FiTag, FiImage, FiCheck, FiX, FiAlertCircle,
  FiUpload, FiDownload, FiGrid, FiList, FiSettings
} from 'react-icons/fi';

const ProductsPanel = () => {
  // Estados
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODOS');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Formulario de producto
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    available: true,
    customizations: []
  });

  // Categorías disponibles
  const categories = [
    'Completos',
    'Fajitas',
    'Empanadas',
    'Bebidas',
    'Acompañamientos',
    'Postres'
  ];

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar productos
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Función para refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  };

  // Función para filtrar productos
  const getFilteredProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'TODOS') {
      filtered = filtered.filter(product => product.category === filterCategory);
    }

    return filtered;
  };

  // Función para agregar producto
  const handleAddProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([productForm]);

      if (error) throw error;

      setShowAddModal(false);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available: true,
        customizations: []
      });
      fetchProducts();
    } catch (error) {
      console.error('Error agregando producto:', error);
    }
  };

  // Función para editar producto
  const handleEditProduct = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productForm)
        .eq('id', selectedProduct.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        available: true,
        customizations: []
      });
      fetchProducts();
    } catch (error) {
      console.error('Error editando producto:', error);
    }
  };

  // Función para eliminar producto
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  // Función para abrir modal de edición
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      image_url: product.image_url || '',
      available: product.available !== false,
      customizations: product.customizations || []
    });
    setShowEditModal(true);
  };

  // Función para abrir modal de agregar
  const openAddModal = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      available: true,
      customizations: []
    });
    setShowAddModal(true);
  };

  // Renderizar formulario de producto
  const renderProductForm = (isEdit = false) => (
    <div className="modal-overlay">
      <div className="modal-content product-form-modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Editar Producto' : 'Agregar Producto'}</h3>
          <button
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
            className="close-btn"
          >
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Nombre del Producto</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
              placeholder="Ej: Completo Italiano"
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
              placeholder="Descripción del producto..."
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>URL de la imagen</label>
            <input
              type="url"
              value={productForm.image_url}
              onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={productForm.available}
                onChange={(e) => setProductForm({...productForm, available: e.target.checked})}
              />
              Producto disponible
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
            className="cancel-btn"
          >
            Cancelar
          </button>
          <button
            onClick={isEdit ? handleEditProduct : handleAddProduct}
            className="confirm-btn"
          >
            {isEdit ? 'Actualizar' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar producto en modo grid
  const renderProductGrid = (product) => (
    <div key={product.id} className="product-card">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <FiPackage />
          </div>
        )}
        <div className="product-overlay">
          <button
            onClick={() => openEditModal(product)}
            className="edit-btn"
          >
            <FiEdit3 />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            className="delete-btn"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      <div className="product-info">
        <h4>{product.name}</h4>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <span className="product-price">${product.price?.toLocaleString()}</span>
          <span className={`product-status ${product.available ? 'available' : 'unavailable'}`}>
            {product.available ? 'Disponible' : 'No disponible'}
          </span>
        </div>
        <div className="product-category">
          <FiTag />
          {product.category}
        </div>
      </div>
    </div>
  );

  // Renderizar producto en modo lista
  const renderProductList = (product) => (
    <div key={product.id} className="product-list-item">
      <div className="product-list-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <FiPackage />
          </div>
        )}
      </div>
      <div className="product-list-info">
        <h4>{product.name}</h4>
        <p>{product.description}</p>
        <div className="product-list-meta">
          <span className="product-price">${product.price?.toLocaleString()}</span>
          <span className="product-category">{product.category}</span>
          <span className={`product-status ${product.available ? 'available' : 'unavailable'}`}>
            {product.available ? 'Disponible' : 'No disponible'}
          </span>
        </div>
      </div>
      <div className="product-list-actions">
        <button
          onClick={() => openEditModal(product)}
          className="edit-btn"
        >
          <FiEdit3 />
        </button>
        <button
          onClick={() => handleDeleteProduct(product.id)}
          className="delete-btn"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <FiRefreshCw className="spinning" />
        <p>Cargando productos...</p>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();

  return (
    <div className="products-section">
      <div className="section-header">
        <h2>Gestión de Productos</h2>
        <div className="header-actions">
          <button onClick={handleRefresh} disabled={isRefreshing} className="refresh-btn">
            <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button onClick={openAddModal} className="add-btn">
            <FiPlus />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="TODOS">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'active' : ''}
          >
            <FiGrid />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'active' : ''}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiPackage />
          </div>
          <div className="stat-content">
            <h3>{products.length}</h3>
            <p>Total Productos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiCheck />
          </div>
          <div className="stat-content">
            <h3>{products.filter(p => p.available).length}</h3>
            <p>Disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiX />
          </div>
          <div className="stat-content">
            <h3>{products.filter(p => !p.available).length}</h3>
            <p>No Disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTag />
          </div>
          <div className="stat-content">
            <h3>{new Set(products.map(p => p.category)).size}</h3>
            <p>Categorías</p>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className={`products-container ${viewMode}`}>
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <FiPackage />
            <h3>No hay productos</h3>
            <p>No se encontraron productos con los filtros actuales.</p>
            <button onClick={openAddModal} className="add-btn">
              <FiPlus />
              Agregar Primer Producto
            </button>
          </div>
        ) : (
          filteredProducts.map(product => 
            viewMode === 'grid' ? renderProductGrid(product) : renderProductList(product)
          )
        )}
      </div>

      {/* Modales */}
      {showAddModal && renderProductForm(false)}
      {showEditModal && renderProductForm(true)}
    </div>
  );
};

export default ProductsPanel; 