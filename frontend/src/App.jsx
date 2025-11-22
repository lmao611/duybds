import React, { useState, useEffect } from 'react';
import { MapPin, User, ArrowLeft, Trash2, Edit, Save, LayoutGrid, LogOut, Lock, UploadCloud, Image as ImageIcon, Loader, Eye, X, ZoomIn, Search, Users, UserPlus } from 'lucide-react';
import api from './api'; 

// ... (Giữ nguyên phần constants, PriceDisplay, ImageUploader, DetailView như cũ)
const CLOUDINARY_CLOUD_NAME = "dqoyqejot"; 
const CLOUDINARY_UPLOAD_PRESET = "duybds"; 
const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

const PriceDisplay = ({ value }) => (
  <span className="font-bold text-red-600 flex items-baseline">
    {value}<sup className="text-[0.6em] ml-[1px] underline decoration-transparent">đ</sup>
  </span>
);

const ImageUploader = ({ label, imageUrl, onUpload, isUploading }) => {
    // ... (Giữ nguyên code cũ)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        onUpload(file);
      };
    
      return (
        <div className="mb-3">
          <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
          <div className="flex items-start gap-2">
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group hover:border-blue-500 transition-colors">
              {isUploading ? (
                <Loader className="animate-spin text-blue-600" />
              ) : imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-1">
                  <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400">Chọn ảnh</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                disabled={isUploading}
              />
            </div>
            {imageUrl && (
               <div className="flex-1 text-xs text-gray-500 break-all">
                 Link: <a href={imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Xem ảnh</a>
               </div>
            )}
          </div>
        </div>
      );
};

const DetailView = ({ item, onBack }) => {
    // ... (Giữ nguyên code cũ)
    const [activeImage, setActiveImage] = useState(item.mainImage || PLACEHOLDER_IMG);
    const [isZoomed, setIsZoomed] = useState(false);
  
    const thumbnails = [item.mainImage, item.thumb1, item.thumb2, item.thumb3].filter(Boolean);
  
    return (
      <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen font-sans text-gray-800 relative">
        {isZoomed && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
            <button className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors">
              <X size={40} />
            </button>
            <img 
              src={activeImage} 
              alt="Zoom" 
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
  
        <button onClick={onBack} className="mb-4 flex items-center text-blue-600 hover:underline font-medium">
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách
        </button>
  
        <div className="bg-white shadow-lg p-4 border border-gray-200 rounded-xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-6 h-auto lg:h-[500px]">
            <div className="w-full lg:w-1/2 flex flex-col gap-2">
              <div 
                className="flex-1 border border-gray-200 rounded-lg overflow-hidden relative cursor-zoom-in group bg-gray-100"
                onClick={() => setIsZoomed(true)}
              >
                <img src={activeImage} alt="Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                  <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" size={48} />
                </div>
              </div>
              
              <div className="h-24 flex gap-2 overflow-x-auto pb-1">
                {thumbnails.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`h-full w-24 flex-shrink-0 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${activeImage === img ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-400'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
  
            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 h-full overflow-y-auto">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase leading-snug">{item.address}</h1>
                  <div className="text-3xl mb-4 flex items-end gap-2">
                      <PriceDisplay value={item.totalPrice} />
                      <span className="text-gray-500 text-base font-normal mb-1">
                        ~ {item.pricePerM2}đ/m²
                      </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-white p-3 rounded border shadow-sm">
                          <span className="block text-gray-500 text-xs uppercase font-bold">Diện tích</span>
                          <span className="font-bold text-lg">{item.area} m²</span>
                      </div>
                      <div className="bg-white p-3 rounded border shadow-sm">
                          <span className="block text-gray-500 text-xs uppercase font-bold">Hướng</span>
                          <span className="font-bold text-lg">{item.direction}</span>
                      </div>
                      <div className="bg-white p-3 rounded border shadow-sm">
                          <span className="block text-gray-500 text-xs uppercase font-bold">Rộng x Dài</span>
                          <span className="font-bold text-lg">{item.width} m x {item.length} m</span>
                      </div>
                      <div className="bg-white p-3 rounded border shadow-sm">
                          <span className="block text-gray-500 text-xs uppercase font-bold">Pháp lý/Loại</span>
                          <span className="font-bold text-lg">{item.type}</span>
                      </div>
                  </div>
  
                  <div className="border-t border-blue-200 pt-4 mt-auto">
                      <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm">Mô tả chi tiết</h3>
                      <p className="whitespace-pre-line text-gray-700 text-justify leading-relaxed text-sm">
                          {item.description || "Chưa có nội dung mô tả."}
                      </p>
                  </div>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-3 p-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-600"/>
                  </div>
                  <div>
                      <div className="text-xs text-gray-500 uppercase font-bold">Liên hệ chính chủ</div>
                      <div className="font-bold text-gray-900">{item.ownerName}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3 p-2 border-l-0 md:border-l border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="font-bold text-green-700 text-xs">TEL</span>
                  </div>
                  <div>
                      <div className="text-xs text-gray-500 uppercase font-bold">Số điện thoại</div>
                      <div className="font-bold text-lg font-mono text-green-700">{item.phone}</div>
                  </div>
              </div>
              <div className="flex items-center gap-3 p-2 border-l-0 md:border-l border-gray-100 justify-start md:justify-end">
                  <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase font-bold">Ngày đăng tin</div>
                      <div className="font-bold text-gray-700">{item.regDate}</div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    );
};

// Component Quản lý tài khoản trong Admin Panel
const UserManager = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (e) { console.error(e); }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Xóa tài khoản này?")) return;
    try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
    } catch (e) { alert("Lỗi xóa user"); }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Danh sách tài khoản</div>
        <table className="w-full text-left">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                <tr>
                    <th className="p-3">Email</th>
                    <th className="p-3">Vai Trò</th>
                    <th className="p-3 text-right">Hành Động</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {u.role}
                            </span>
                        </td>
                        <td className="p-3 text-right">
                            {u.role !== 'admin' && (
                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
};

const AdminPanel = ({ 
  formData, setFormData, formMode, properties, 
  onSave, onDelete, onEdit, onLogout, onRandom, onReset 
}) => {
  const [tab, setTab] = useState('properties');
  const [uploadingField, setUploadingField] = useState(null);

  const uploadImage = async (file, fieldName) => {
    setUploadingField(fieldName);
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(url, { method: "POST", body: data });
      const result = await response.json();
      if (result.secure_url) setFormData(prev => ({ ...prev, [fieldName]: result.secure_url }));
    } catch (error) { alert("Lỗi upload ảnh"); } finally { setUploadingField(null); }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><LayoutGrid /> Admin Panel</h2>
        <div className="flex items-center gap-4">
            <div className="bg-white border rounded-lg p-1 flex">
                <button onClick={() => setTab('properties')} className={`px-4 py-2 rounded text-sm font-bold ${tab === 'properties' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>Tin Đăng</button>
                <button onClick={() => setTab('users')} className={`px-4 py-2 rounded text-sm font-bold flex items-center gap-1 ${tab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}><Users size={14}/> Tài Khoản</button>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"><LogOut size={18} /> Thoát</button>
        </div>
      </div>

      {tab === 'users' ? <UserManager /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md h-fit overflow-y-auto max-h-screen sticky top-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">{formMode === 'add' ? 'Thêm Mới' : 'Chỉnh Sửa'}</h3>
                    <div className="flex gap-2">
                        <button type="button" onClick={onRandom} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700">Mẫu</button>
                        {formMode === 'edit' && <button onClick={onReset} className="text-xs text-blue-600 hover:underline">Hủy</button>}
                    </div>
                </div>
                <form onSubmit={onSave} className="space-y-3">
                    {/* ... Các ô input giữ nguyên như cũ ... */}
                    <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Địa chỉ (Tiêu đề)" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded text-sm" placeholder="Giá tổng" type="number" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} required />
                        <input className="p-2 border rounded text-sm" placeholder="Giá/m2" type="number" value={formData.pricePerM2} onChange={e => setFormData({...formData, pricePerM2: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded text-sm" placeholder="Diện tích" type="number" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} />
                        <input className="p-2 border rounded text-sm" placeholder="Loại nhà" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded text-sm" placeholder="Rộng" type="number" value={formData.width} onChange={e => setFormData({...formData, width: e.target.value})} />
                        <input className="p-2 border rounded text-sm" placeholder="Dài" type="number" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                    </div>
                    <input className="w-full p-2 border rounded text-sm" placeholder="Hướng" value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})} />
                    <div className="grid grid-cols-2 gap-2">
                        <input className="p-2 border rounded text-sm" placeholder="Chủ nhà" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                        <input className="p-2 border rounded text-sm" placeholder="Điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <input className="w-full p-2 border rounded text-sm" placeholder="Ngày đăng" value={formData.regDate} onChange={e => setFormData({...formData, regDate: e.target.value})} />
                    <textarea className="w-full p-2 border rounded h-24 text-sm" placeholder="Nội dung..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2"><UploadCloud size={16} /> Upload Hình Ảnh</h4>
                        <ImageUploader label="Hình Chính" imageUrl={formData.mainImage} onUpload={(file) => uploadImage(file, 'mainImage')} isUploading={uploadingField === 'mainImage'} />
                        <div className="grid grid-cols-3 gap-2">
                            <ImageUploader label="Thumb 1" imageUrl={formData.thumb1} onUpload={(file) => uploadImage(file, 'thumb1')} isUploading={uploadingField === 'thumb1'} />
                            <ImageUploader label="Thumb 2" imageUrl={formData.thumb2} onUpload={(file) => uploadImage(file, 'thumb2')} isUploading={uploadingField === 'thumb2'} />
                            <ImageUploader label="Thumb 3" imageUrl={formData.thumb3} onUpload={(file) => uploadImage(file, 'thumb3')} isUploading={uploadingField === 'thumb3'} />
                        </div>
                    </div>
                    <button type="submit" disabled={uploadingField !== null} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-bold flex justify-center items-center gap-2 mt-4 disabled:bg-gray-400"><Save size={16} /> {formMode === 'add' ? 'Đăng Tin' : 'Lưu Thay Đổi'}</button>
                </form>
            </div>
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Danh Sách Đang Đăng ({properties.length})</div>
                    <div className="divide-y divide-gray-100 h-[600px] overflow-y-auto">
                        {properties.length === 0 ? <div className="p-8 text-center text-gray-400">Chưa có tin đăng nào.</div> : properties.map(item => (
                            <div key={item._id} className="p-4 flex items-center gap-4 hover:bg-gray-50 group">
                                <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 border"><img src={item.mainImage || PLACEHOLDER_IMG} className="w-full h-full object-cover" alt="" /></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-800 truncate">{item.address}</h4>
                                    <div className="text-sm text-red-500 font-bold"><PriceDisplay value={item.totalPrice} /></div>
                                    <div className="text-xs text-gray-500">{item.regDate} - {item.ownerName}</div>
                                </div>
                                <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Edit size={18}/></button>
                                    <button onClick={() => onDelete(item._id)} className="p-2 text-red-600 hover:bg-red-100 rounded"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const RealEstateApp = () => {
  const [view, setView] = useState('home');
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user'); // Role state

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Login/Register

  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [formMode, setFormMode] = useState('add'); 
  const [formData, setFormData] = useState({
    address: '', totalPrice: '', pricePerM2: '', area: '', type: '',
    width: '', length: '', direction: '', ownerName: '', phone: '',
    regDate: new Date().toLocaleDateString('vi-VN'), description: '',
    mainImage: '', thumb1: '', thumb2: '', thumb3: ''
  });

  useEffect(() => {
    fetchProperties();
    const storedToken = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('role'); // Lấy role từ local storage
    if (storedToken) {
      setIsLoggedIn(true);
      if (storedRole) setUserRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = properties.filter(item => 
        item.address.toLowerCase().includes(lowerTerm) ||
        item.ownerName.toLowerCase().includes(lowerTerm) ||
        item.type.toLowerCase().includes(lowerTerm)
      );
      setFilteredProperties(filtered);
    }
  }, [searchTerm, properties]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties');
      setProperties(res.data);
      setFilteredProperties(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/register' : '/login';
    try {
      const res = await api.post(endpoint, authForm);
      
      if (isRegistering) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsRegistering(false);
      } else {
        const { accessToken, refreshToken, role } = res.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('role', role); // Lưu role

        setIsLoggedIn(true);
        setUserRole(role);
        
        // Chỉ Admin mới được chuyển sang trang admin
        if (role === 'admin') setView('admin'); 
        else setView('home');

        setAuthForm({ email: '', password: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xác thực");
    }
  };

  const handleLogout = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if(refreshToken) await api.post('/logout', { refreshToken });
    } catch (error) { console.error(error); } finally {
        localStorage.clear();
        setIsLoggedIn(false);
        setUserRole('user');
        setView('home');
    }
  };

  // ... (Giữ nguyên handleSaveProperty, handleDelete, handleEdit, resetForm, fillRandomData)
  const handleSaveProperty = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'add') { await api.post('/properties', formData); alert('Đã thêm!'); } 
      else { await api.put(`/properties/${formData._id}`, formData); alert('Đã cập nhật!'); }
      await fetchProperties(); resetForm();
    } catch (error) { alert("Lỗi lưu tin"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa tin này?")) return;
    try { await api.delete(`/properties/${id}`); fetchProperties(); } 
    catch (error) { alert("Lỗi xóa tin"); }
  };

  const handleEdit = (prop) => { setFormData(prop); setFormMode('edit'); };

  const resetForm = () => {
    setFormData({
      address: '', totalPrice: '', pricePerM2: '', area: '', type: '', width: '', length: '', direction: '', ownerName: '', phone: '',
      regDate: new Date().toLocaleDateString('vi-VN'), description: '', mainImage: '', thumb1: '', thumb2: '', thumb3: ''
    }); setFormMode('add');
  };

  const fillRandomData = () => {
    setFormData({
      address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM', totalPrice: '155000000000', pricePerM2: '643000000', area: '200', type: 'Biệt thự đơn lập',
      width: '10', length: '20', direction: 'Đông Nam', ownerName: 'Nguyễn Văn A', phone: '0909123456', regDate: '22/11/2025', description: 'Mô tả...',
      mainImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', thumb1: '', thumb2: '', thumb3: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tighter flex items-center gap-2 cursor-pointer text-blue-900" onClick={() => setView('home')}>
            <MapPin className="text-blue-600" strokeWidth={2.5} /> DUY<span className="text-blue-600">BẤT ĐỘNG SẢN</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setView('home')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${view === 'home' || view === 'detail' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}>Trang Chủ</button>
            
            {isLoggedIn ? (
                userRole === 'admin' ? (
                    <button onClick={() => setView('admin')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-all ${view === 'admin' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}><User size={16}/> Admin</button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-full"><User size={16}/> Khách</div>
                )
            ) : (
                <button onClick={() => setView('login')} className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 transition-all ${view === 'login' ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}><Lock size={16}/> Đăng Nhập</button>
            )}

            {isLoggedIn && view !== 'admin' && (
                <button onClick={handleLogout} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-full"><LogOut size={16}/></button>
            )}
          </div>
        </div>
      </nav>

      <div className="pb-20">
        {view === 'home' && (
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
              <div><h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kho Bất Động Sản</h1><p className="text-gray-500 mt-1">Cập nhật mới nhất tháng 11/2025</p></div>
              <div className="relative w-full sm:w-96"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="text-gray-400" size={20}/></div><input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-shadow shadow-sm" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </div>
            {loading ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg w-full"></div>)}</div> : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead><tr className="bg-gray-50 text-gray-600 text-xs uppercase font-bold border-b"><th className="p-4 w-[40%]">Bất Động Sản</th><th className="p-4 w-[15%]">Giá</th><th className="p-4 w-[15%]">Loại</th><th className="p-4 w-[10%] text-center">Diện Tích</th><th className="p-4 w-[10%]">Ngày Đăng</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredProperties.map(item => (
                            <tr key={item._id} className="hover:bg-blue-50 transition-colors group cursor-pointer" onClick={() => { setSelectedProperty(item); setView('detail'); }}>
                                <td className="p-4"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0"><img src={item.mainImage || PLACEHOLDER_IMG} className="w-full h-full object-cover" alt="thumb"/></div><div><div className="font-bold text-gray-900 line-clamp-1 mb-1 text-sm group-hover:text-blue-600">{item.address}</div><div className="text-xs text-gray-500 flex items-center gap-1"><User size={12}/> {item.ownerName}</div></div></div></td>
                                <td className="p-4"><PriceDisplay value={item.totalPrice} /></td>
                                <td className="p-4"><span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200">{item.type}</span></td>
                                <td className="p-4 text-center text-sm font-medium text-gray-600">{item.area} m²</td>
                                <td className="p-4 text-sm text-gray-500">{item.regDate}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
                  {!loading && filteredProperties.length === 0 && <div className="text-center py-20 text-gray-500">Không tìm thấy kết quả.</div>}
                </div>
            )}
          </div>
        )}

        {view === 'detail' && selectedProperty && <DetailView item={selectedProperty} onBack={() => setView('home')} />}

        {view === 'login' && (
          <div className="flex items-center justify-center h-[80vh]">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 flex justify-center items-center gap-2">
                {isRegistering ? <UserPlus className="text-blue-600"/> : <Lock className="text-blue-600"/>} 
                {isRegistering ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} placeholder="email@example.com" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label><input type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••" required /></div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{isRegistering ? 'Đăng Ký Ngay' : 'Đăng Nhập'}</button>
              </form>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-500">{isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</span>
                <button onClick={() => setIsRegistering(!isRegistering)} className="ml-2 text-blue-600 font-bold hover:underline">{isRegistering ? 'Đăng nhập' : 'Đăng ký miễn phí'}</button>
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && isLoggedIn && userRole === 'admin' && (
          <AdminPanel 
            formData={formData} setFormData={setFormData} formMode={formMode} properties={properties}
            onSave={handleSaveProperty} onDelete={handleDelete} onEdit={handleEdit} onLogout={handleLogout} onRandom={fillRandomData} onReset={resetForm}
          />
        )}
      </div>
    </div>
  );
};

export default RealEstateApp;