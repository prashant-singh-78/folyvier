import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Database,
  ExternalLink,
  Layers,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
import { api, resolveAssetUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { Logo } from '../components/common/Logo';

// Strictly NO CRM, sales pipeline, or lead management modules
const TABS = [
  { id: 'stats', label: 'Dashboard Stats', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'products', label: 'Product & 650 nm Tech', icon: Package },
  { id: 'conditions', label: 'Condition Management', icon: Layers },
  { id: 'whatsapp', label: 'WhatsApp Settings', icon: MessageCircle },
];

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const { refreshSiteData } = useSite();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [statsData, setStatsData] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [techDraft, setTechDraft] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [waSettings, setWaSettings] = useState(null);
  const [waCloudInfo, setWaCloudInfo] = useState(null);
  const [waMessages, setWaMessages] = useState([]);
  const [waFilter, setWaFilter] = useState('all');

  // Product & Condition editors
  const [productDraft, setProductDraft] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [conditionDraft, setConditionDraft] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [st, us, pr, co, ws, wm] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProducts(),
        api.getAdminConditions(),
        api.getWhatsAppSettings(),
        api.getWhatsAppMessages('all'),
      ]);

      setStatsData(st);
      setUsers(us.users || []);
      setProducts(pr.products || []);
      setTechDraft({
        ...(pr.technology_650nm || {}),
        featuresText: (pr.technology_650nm?.features || []).join('\n'),
      });
      setConditions(co.conditions || []);
      setWaSettings(ws.settings || null);
      setWaCloudInfo(ws.cloud_api || null);
      setWaMessages(wm.messages || []);

      if ((pr.products || []).length && !productDraft) {
        const p0 = pr.products[0];
        setProductDraft({
          ...p0,
          featuresText: (p0.features || []).join('\n'),
        });
      }
      if ((co.conditions || []).length && !conditionDraft) {
        const c0 = co.conditions[0];
        setConditionDraft({
          ...c0,
          indicatorsText: (c0.visual_indicators || []).join('\n'),
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to load Super Admin data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpload = async (file, onUrl) => {
    if (!file) return;
    setSaving(true);
    try {
      const res = await api.uploadImage(file);
      onUrl(res.url);
      showToast('Image uploaded! Click Save to publish.', 'success');
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const startNewProduct = () => {
    setIsNewProduct(true);
    setProductDraft({
      product_id: '',
      product_name: '',
      product_description: '',
      wavelength: '650 nm',
      specifications: '',
      components: '',
      usage_instructions: '',
      safety_information: '',
      featuresText: '650 nm Red Light Wavelength System',
      condition_mapping: ['condition-1'],
      product_images: ['/images/folibeir-device-650nm.jpg'],
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productDraft) return;
    setSaving(true);
    try {
      const payload = {
        product_name: productDraft.product_name,
        product_description: productDraft.product_description,
        wavelength: productDraft.wavelength || '650 nm',
        specifications: productDraft.specifications,
        components: productDraft.components,
        usage_instructions: productDraft.usage_instructions,
        safety_information: productDraft.safety_information,
        features: productDraft.featuresText
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
        condition_mapping: productDraft.condition_mapping || [],
        product_images: productDraft.product_images || ['/images/folibeir-device-650nm.jpg'],
      };

      if (isNewProduct) {
        const res = await api.createProduct(payload);
        setProducts((prev) => [...prev, res.product]);
        setIsNewProduct(false);
        setProductDraft({ ...res.product, featuresText: (res.product.features || []).join('\n') });
        showToast('New FOLIBEIR product created!', 'success');
      } else {
        const res = await api.updateProduct(productDraft.product_id, payload);
        setProducts((prev) =>
          prev.map((p) => (p.product_id === res.product.product_id ? res.product : p))
        );
        setProductDraft({ ...res.product, featuresText: (res.product.features || []).join('\n') });
        showToast('Product updated live!', 'success');
      }
      await refreshSiteData();
    } catch (err) {
      showToast(err.message || 'Product save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(productId);
      const remaining = products.filter((p) => p.product_id !== productId);
      setProducts(remaining);
      setProductDraft(
        remaining[0]
          ? { ...remaining[0], featuresText: (remaining[0].features || []).join('\n') }
          : null
      );
      await refreshSiteData();
      showToast('Product removed.', 'info');
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    }
  };

  const handleSaveTechnology = async (e) => {
    e.preventDefault();
    if (!techDraft) return;
    setSaving(true);
    try {
      const payload = {
        wavelength: techDraft.wavelength || '650 nm',
        title: techDraft.title,
        technical_description: techDraft.technical_description,
        device_components: techDraft.device_components,
        operating_specifications: techDraft.operating_specifications,
        usage_instructions: techDraft.usage_instructions,
        safety_information: techDraft.safety_information,
        features: techDraft.featuresText
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
        hero_image: techDraft.hero_image,
      };
      await api.updateTechnology(payload);
      await refreshSiteData();
      showToast('650 nm Red Light Technology specifications published!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update technology.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCondition = async (e) => {
    e.preventDefault();
    if (!conditionDraft) return;
    setSaving(true);
    try {
      const res = await api.updateCondition(conditionDraft.code, {
        title: conditionDraft.title,
        category_label: conditionDraft.category_label,
        severity_tag: conditionDraft.severity_tag,
        description: conditionDraft.description,
        detailed_overview: conditionDraft.detailed_overview,
        image_url: conditionDraft.image_url,
        visual_indicators: conditionDraft.indicatorsText
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean),
      });
      setConditions((prev) =>
        prev.map((c) => (c.code === res.condition.code ? res.condition : c))
      );
      await refreshSiteData();
      showToast('Hair condition updated live!', 'success');
    } catch (err) {
      showToast(err.message || 'Condition update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWhatsAppSettings = async (e) => {
    e.preventDefault();
    if (!waSettings) return;
    setSaving(true);
    try {
      const res = await api.updateWhatsAppSettings({
        owner_whatsapp_number: waSettings.owner_whatsapp_number,
        notify_owner_on_register: waSettings.notify_owner_on_register,
        notify_owner_on_first_login: waSettings.notify_owner_on_first_login,
        notify_owner_on_assessment: waSettings.notify_owner_on_assessment,
        auto_message_customer_on_assessment: waSettings.auto_message_customer_on_assessment,
        owner_template_name: waSettings.owner_template_name,
        customer_template_name: waSettings.customer_template_name,
        owner_assessment_template: waSettings.owner_assessment_template,
        customer_templates: waSettings.customer_templates,
      });
      setWaSettings(res.settings);
      showToast('WhatsApp Business Automation settings saved!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save WhatsApp settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRetryMessage = async (messageId) => {
    setSaving(true);
    try {
      const res = await api.retryWhatsAppMessage(messageId);
      showToast(
        res.success ? 'WhatsApp message retried successfully!' : 'Retry failed — see error details.',
        res.success ? 'success' : 'error'
      );
      const wm = await api.getWhatsAppMessages('all');
      setWaMessages(wm.messages || []);
      const st = await api.getAdminStats();
      setStatsData(st);
    } catch (err) {
      showToast(err.message || 'Retry failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const toggleProductCondition = (code) => {
    setProductDraft((d) => {
      const curr = d.condition_mapping || [];
      return {
        ...d,
        condition_mapping: curr.includes(code) ? curr.filter((x) => x !== code) : [...curr, code],
      };
    });
  };

  const visibleWaMessages =
    waFilter === 'all' ? waMessages : waMessages.filter((m) => m.message_status === waFilter);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-64 bg-[#071120] border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col shrink-0">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <Logo />
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#1677FF]/20 text-[#7CB5FF] border border-[#1677FF]/30">
            Admin
          </span>
        </div>

        <nav className="p-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible flex-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#1677FF] text-white shadow-lg shadow-[#1677FF]/25'
                    : 'text-[#B8C2D1] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/[0.08] space-y-3">
          <div className="text-xs">
            <p className="font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-[#B8C2D1]/75 truncate">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/10 text-xs font-medium text-center inline-flex items-center justify-center gap-1"
            >
              Site <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 py-2 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-medium inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {TABS.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-[#B8C2D1] mt-0.5">
              FOLIBEIR Super Admin · Products, Conditions, Users & Automated WhatsApp Control
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {statsData?.system_status && (
              <>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A192F] border border-white/10 text-xs text-[#B8C2D1]">
                  <Database className="w-3.5 h-3.5 text-[#1677FF]" />
                  DB: <strong className="text-white">{statsData.system_status.database_mode}</strong>
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs ${
                    statsData.system_status.whatsapp_cloud_configured
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp:{' '}
                  {statsData.system_status.whatsapp_cloud_configured ? 'Live Cloud API' : 'Sandbox'}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={loadAll}
              className="btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading && !statsData ? (
          <div className="py-24 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1677FF]" />
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD STATISTICS */}
            {activeTab === 'stats' && statsData && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                  {[
                    { label: 'Registered Users', val: statsData.stats.total_registered_users, color: 'text-white' },
                    { label: 'Total Assessments', val: statsData.stats.total_assessments, color: 'text-[#7CB5FF]' },
                    { label: 'Condition 1', val: statsData.stats.condition_1_selections, color: 'text-[#5EA2FF]' },
                    { label: 'Condition 2', val: statsData.stats.condition_2_selections, color: 'text-sky-300' },
                    { label: 'Condition 3', val: statsData.stats.condition_3_selections, color: 'text-indigo-300' },
                    { label: 'WhatsApp Sent', val: statsData.stats.whatsapp_messages_sent, color: 'text-emerald-400' },
                    { label: 'WhatsApp Failed', val: statsData.stats.failed_whatsapp_messages, color: 'text-red-400' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="glass-card rounded-2xl p-4">
                      <p className="text-[11px] font-medium text-[#B8C2D1]">{kpi.label}</p>
                      <p className={`text-2xl font-extrabold mt-1.5 ${kpi.color}`}>{kpi.val}</p>
                    </div>
                  ))}
                </div>

                {/* Condition Selection Breakdown */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h2 className="text-base font-bold text-white">Condition Selection Distribution</h2>
                  {[
                    { label: 'Condition 1 – Early Hair Thinning', count: statsData.stats.condition_1_selections },
                    { label: 'Condition 2 – Moderate Hair Loss', count: statsData.stats.condition_2_selections },
                    { label: 'Condition 3 – Advanced Hair Loss', count: statsData.stats.condition_3_selections },
                  ].map((row) => {
                    const total = Math.max(statsData.stats.total_assessments, 1);
                    const pct = Math.round((row.count / total) * 100);
                    return (
                      <div key={row.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white font-medium">{row.label}</span>
                          <span className="text-[#B8C2D1]">
                            {row.count} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#1677FF] to-[#5EA2FF]"
                            style={{ width: `${Math.max(pct, row.count > 0 ? 6 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0A192F] text-[#B8C2D1] border-b border-white/10">
                      <tr>
                        <th className="p-4">Full Name & Email</th>
                        <th className="p-4">Mobile / WhatsApp</th>
                        <th className="p-4">Selected Condition</th>
                        <th className="p-4">WhatsApp Consent</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Registered Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-[#B8C2D1]">
                            No registered customers yet.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.user_id} className="hover:bg-white/[0.02]">
                            <td className="p-4">
                              <p className="font-bold text-white">{u.full_name}</p>
                              <p className="text-[#B8C2D1]">{u.email}</p>
                            </td>
                            <td className="p-4 text-[#B8C2D1]">
                              <p>WA: {u.whatsapp_number || '—'}</p>
                              <p className="text-[11px] text-white/50">Mob: {u.mobile_number || '—'}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-[#7CB5FF] font-semibold">
                                {u.latest_assessment?.condition_label || u.selected_condition || 'Not Assessed'}
                              </span>
                              <p className="text-[10px] text-white/45">
                                {u.assessment_count || 0} assessments
                              </p>
                            </td>
                            <td className="p-4">
                              {u.whatsapp_consent ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Opted In
                                </span>
                              ) : (
                                <span className="text-[#B8C2D1]/60">No Consent</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                Active
                              </span>
                            </td>
                            <td className="p-4 text-[#B8C2D1]">
                              {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. PRODUCT & 650 NM TECHNOLOGY MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                {/* 650 nm Technology Editor */}
                {techDraft && (
                  <form
                    onSubmit={handleSaveTechnology}
                    className="glass-card rounded-2xl p-6 space-y-4 border border-red-500/25"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-red-400" />
                        <h2 className="text-lg font-bold text-white">
                          650 nm Red Light Technology Configuration
                        </h2>
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        Save 650 nm Tech
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Wavelength
                        </label>
                        <input
                          type="text"
                          value={techDraft.wavelength || ''}
                          onChange={(e) => setTechDraft((t) => ({ ...t, wavelength: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Technology Title
                        </label>
                        <input
                          type="text"
                          value={techDraft.title || ''}
                          onChange={(e) => setTechDraft((t) => ({ ...t, title: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Technical Description
                      </label>
                      <textarea
                        rows={2}
                        value={techDraft.technical_description || ''}
                        onChange={(e) =>
                          setTechDraft((t) => ({ ...t, technical_description: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Device Components
                        </label>
                        <input
                          type="text"
                          value={techDraft.device_components || ''}
                          onChange={(e) =>
                            setTechDraft((t) => ({ ...t, device_components: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Operating Specifications
                        </label>
                        <input
                          type="text"
                          value={techDraft.operating_specifications || ''}
                          onChange={(e) =>
                            setTechDraft((t) => ({
                              ...t,
                              operating_specifications: e.target.value,
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Usage Instructions
                        </label>
                        <input
                          type="text"
                          value={techDraft.usage_instructions || ''}
                          onChange={(e) =>
                            setTechDraft((t) => ({ ...t, usage_instructions: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Safety Information
                        </label>
                        <input
                          type="text"
                          value={techDraft.safety_information || ''}
                          onChange={(e) =>
                            setTechDraft((t) => ({ ...t, safety_information: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* Product Catalog CRUD */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  <div className="xl:col-span-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-[#B8C2D1] uppercase tracking-wider">
                        Products ({products.length})
                      </h2>
                      <button
                        type="button"
                        onClick={startNewProduct}
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Product
                      </button>
                    </div>
                    {products.map((p) => (
                      <button
                        key={p.product_id}
                        type="button"
                        onClick={() => {
                          setIsNewProduct(false);
                          setProductDraft({ ...p, featuresText: (p.features || []).join('\n') });
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer ${
                          !isNewProduct && productDraft?.product_id === p.product_id
                            ? 'bg-[#1677FF]/20 border-[#1677FF]'
                            : 'bg-[#081326] border-white/10 hover:border-[#1677FF]/40'
                        }`}
                      >
                        <img
                          src={resolveAssetUrl(p.product_images?.[0] || '/images/folibeir-device-650nm.jpg')}
                          alt={p.product_name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.product_name}</p>
                          <p className="text-[11px] text-[#5EA2FF]">
                            {(p.condition_mapping || []).join(', ') || 'Unmapped'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {productDraft && (
                    <form
                      onSubmit={handleSaveProduct}
                      className="xl:col-span-8 glass-card rounded-2xl p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                        <h3 className="text-lg font-bold text-white">
                          {isNewProduct ? 'Add New FOLIBEIR Product' : 'Edit FOLIBEIR Product'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!isNewProduct && (
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(productDraft.product_id)}
                              className="p-2 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            {isNewProduct ? 'Create Product' : 'Save Product'}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-[#050C18] border border-white/10">
                        <img
                          src={resolveAssetUrl(productDraft.product_images?.[0])}
                          alt="Product preview"
                          className="w-24 h-18 rounded-xl object-cover"
                        />
                        <label className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          Upload Product Image
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="hidden"
                            onChange={(e) =>
                              handleUpload(e.target.files?.[0], (url) =>
                                setProductDraft((d) => ({
                                  ...d,
                                  product_images: [url, ...(d.product_images || []).slice(1)],
                                }))
                              )
                            }
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={productDraft.product_name || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, product_name: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Wavelength
                          </label>
                          <input
                            type="text"
                            value={productDraft.wavelength || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, wavelength: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1.5">
                          Map to Hair Conditions
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {conditions.map((c) => {
                            const checked = (productDraft.condition_mapping || []).includes(c.code);
                            return (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => toggleProductCondition(c.code)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                                  checked
                                    ? 'bg-[#1677FF] text-white border-[#1677FF]'
                                    : 'bg-[#050C18] text-[#B8C2D1] border-white/15'
                                }`}
                              >
                                {c.category_label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Product Description
                        </label>
                        <textarea
                          rows={2}
                          value={productDraft.product_description || ''}
                          onChange={(e) =>
                            setProductDraft((d) => ({ ...d, product_description: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Operating Specifications
                          </label>
                          <input
                            type="text"
                            value={productDraft.specifications || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, specifications: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Device Components
                          </label>
                          <input
                            type="text"
                            value={productDraft.components || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, components: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Usage Instructions
                          </label>
                          <input
                            type="text"
                            value={productDraft.usage_instructions || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, usage_instructions: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                            Safety Information
                          </label>
                          <input
                            type="text"
                            value={productDraft.safety_information || ''}
                            onChange={(e) =>
                              setProductDraft((d) => ({ ...d, safety_information: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Product Features (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={productDraft.featuresText || ''}
                          onChange={(e) =>
                            setProductDraft((d) => ({ ...d, featuresText: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* 4. CONDITION MANAGEMENT */}
            {activeTab === 'conditions' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-3">
                  {conditions.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() =>
                        setConditionDraft({
                          ...c,
                          indicatorsText: (c.visual_indicators || []).join('\n'),
                        })
                      }
                      className={`w-full text-left p-4 rounded-2xl border flex items-center gap-3.5 cursor-pointer ${
                        conditionDraft?.code === c.code
                          ? 'bg-[#1677FF]/20 border-[#1677FF]'
                          : 'bg-[#081326] border-white/10'
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(c.image_url)}
                        alt={c.title}
                        className="w-14 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase text-[#5EA2FF]">
                          Condition {c.stage_number}
                        </p>
                        <p className="text-sm font-bold text-white">{c.title}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {conditionDraft && (
                  <form
                    onSubmit={handleSaveCondition}
                    className="xl:col-span-8 glass-card rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <h3 className="text-lg font-bold text-white">
                        Edit {conditionDraft.category_label}
                      </h3>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> Save Condition
                      </button>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#050C18] border border-white/10">
                      <img
                        src={resolveAssetUrl(conditionDraft.image_url)}
                        alt={conditionDraft.title}
                        className="w-24 h-18 rounded-xl object-cover"
                      />
                      <label className="btn-secondary px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Condition Image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="hidden"
                          onChange={(e) =>
                            handleUpload(e.target.files?.[0], (url) =>
                              setConditionDraft((d) => ({ ...d, image_url: url }))
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Condition Name
                        </label>
                        <input
                          type="text"
                          value={conditionDraft.title || ''}
                          onChange={(e) =>
                            setConditionDraft((d) => ({ ...d, title: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                          Category Label
                        </label>
                        <input
                          type="text"
                          value={conditionDraft.category_label || ''}
                          onChange={(e) =>
                            setConditionDraft((d) => ({ ...d, category_label: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={conditionDraft.description || ''}
                        onChange={(e) =>
                          setConditionDraft((d) => ({ ...d, description: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Visual Indicators (one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={conditionDraft.indicatorsText || ''}
                        onChange={(e) =>
                          setConditionDraft((d) => ({ ...d, indicatorsText: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 5. WHATSAPP SETTINGS, DELIVERY TRACKING & RETRY */}
            {activeTab === 'whatsapp' && waSettings && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveWhatsAppSettings}
                  className="glass-card rounded-2xl p-6 space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Dual Automatic WhatsApp Configuration
                      </h2>
                      <p className="text-xs text-[#B8C2D1]">
                        Configure Business Owner WhatsApp number, triggers, and personalized
                        templates. Webhook URL:{' '}
                        <code className="text-[#7CB5FF]">{waCloudInfo?.webhook_url}</code>
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-4 h-4" /> Save Settings
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Business Owner WhatsApp Number (w/ Country Code)
                      </label>
                      <input
                        type="tel"
                        value={waSettings.owner_whatsapp_number || ''}
                        onChange={(e) =>
                          setWaSettings((s) => ({ ...s, owner_whatsapp_number: e.target.value }))
                        }
                        placeholder="e.g. 919876543210"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Approved Meta Template (Owner - Optional)
                      </label>
                      <input
                        type="text"
                        value={waSettings.owner_template_name || ''}
                        onChange={(e) =>
                          setWaSettings((s) => ({ ...s, owner_template_name: e.target.value }))
                        }
                        placeholder="Leave blank for direct text"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#B8C2D1] mb-1">
                        Approved Meta Template (Customer - Optional)
                      </label>
                      <input
                        type="text"
                        value={waSettings.customer_template_name || ''}
                        onChange={(e) =>
                          setWaSettings((s) => ({ ...s, customer_template_name: e.target.value }))
                        }
                        placeholder="Leave blank for direct text"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Notification Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'notify_owner_on_register', label: 'Owner Alert on Register' },
                      { key: 'notify_owner_on_first_login', label: 'Owner Alert on First Login' },
                      { key: 'notify_owner_on_assessment', label: 'Owner Alert on Assessment' },
                      { key: 'auto_message_customer_on_assessment', label: 'Auto-Message Customer' },
                    ].map((toggle) => (
                      <label
                        key={toggle.key}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-[#050C18] border border-white/10 text-xs text-white cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(waSettings[toggle.key])}
                          onChange={(e) =>
                            setWaSettings((s) => ({ ...s, [toggle.key]: e.target.checked }))
                          }
                          className="accent-[#1677FF] w-4 h-4"
                        />
                        <span>{toggle.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Message Templates */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5EA2FF] mb-1">
                        Business Owner Assessment Notification Template
                      </label>
                      <textarea
                        rows={6}
                        value={waSettings.owner_assessment_template || ''}
                        onChange={(e) =>
                          setWaSettings((s) => ({
                            ...s,
                            owner_assessment_template: e.target.value,
                          }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-xs text-white font-mono"
                      />
                    </div>

                    {['condition-1', 'condition-2', 'condition-3'].map((code, idx) => (
                      <div key={code}>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">
                          Customer Personalized Template — Condition {idx + 1}
                        </label>
                        <textarea
                          rows={6}
                          value={waSettings.customer_templates?.[code] || ''}
                          onChange={(e) =>
                            setWaSettings((s) => ({
                              ...s,
                              customer_templates: {
                                ...(s.customer_templates || {}),
                                [code]: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#050C18] border border-white/15 text-xs text-white font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </form>

                {/* Delivery Status & Failed Message Retry Queue */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base font-bold text-white">
                      Message Delivery Tracking & Failed Queue ({visibleWaMessages.length})
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {['all', 'sent', 'delivered', 'sandbox_logged', 'failed'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setWaFilter(st)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize cursor-pointer ${
                            waFilter === st
                              ? 'bg-[#1677FF] text-white'
                              : 'bg-[#0A192F] text-[#B8C2D1] border border-white/10'
                          }`}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {visibleWaMessages.length === 0 ? (
                      <p className="text-xs text-[#B8C2D1]">No WhatsApp messages in this filter.</p>
                    ) : (
                      visibleWaMessages.map((msg) => (
                        <div
                          key={msg.message_id}
                          className="p-4 rounded-xl bg-[#050C18] border border-white/10 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${
                                  msg.recipient_type === 'owner'
                                    ? 'bg-[#1677FF]/20 text-[#7CB5FF]'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {msg.recipient_type}
                              </span>
                              <span className="font-bold text-white">
                                {msg.recipient_number || '(Owner number not set)'}
                              </span>
                              <span className="text-[#B8C2D1]">· {msg.message_template}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  msg.message_status === 'failed'
                                    ? 'bg-red-500/20 text-red-300'
                                    : msg.message_status === 'sent' ||
                                        msg.message_status === 'delivered' ||
                                        msg.message_status === 'read'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-200'
                                }`}
                              >
                                {msg.message_status}
                              </span>
                              {(msg.message_status === 'failed' || msg.message_status === 'sandbox_logged') && (
                                <button
                                  type="button"
                                  disabled={saving}
                                  onClick={() => handleRetryMessage(msg.message_id)}
                                  className="px-2.5 py-1 rounded-lg bg-[#1677FF]/25 hover:bg-[#1677FF] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <RotateCcw className="w-3 h-3" /> Retry
                                </button>
                              )}
                            </div>
                          </div>

                          <pre className="text-xs text-white/85 whitespace-pre-wrap font-sans leading-relaxed">
                            {msg.message_body}
                          </pre>
                          {msg.error_details && (
                            <p className="text-[11px] text-amber-300/90">{msg.error_details}</p>
                          )}
                          <p className="text-[10px] text-white/40">
                            ID: {msg.message_id} · Sent:{' '}
                            {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : '—'} · Retries:{' '}
                            {msg.retry_count || 0}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
