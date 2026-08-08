import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal, Skeleton, DatePicker, Popover, Input, Button, Checkbox } from 'antd';
import {
  SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  ShoppingOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined,
  DownloadOutlined, CloseOutlined, ArrowRightOutlined, FilterOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import useAxiosClient from '../axios-client.js';
import { useStateContext } from '../contexts/ContextProvider.jsx';
import Permission from '../components/Util/Permission.jsx';
import ExportOrderExcel from '../components/Order/ExportOrderExcel';
import OrderInvoice from '../components/OrderInvoice/OrderInvoice';
import { OrderTypeEnum } from '../utils/enums/OrderTypeEnum.js';
import { OrderStatusEnum, settableStatuses, canChangeAnyStatus } from '../utils/enums/OrderStatusEnum';

const API = process.env.REACT_APP_API_BASE_URL;
const PAGE_SIZE = 10;
const AVATARS = ['#e6396c', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#0ea5e9'];

const fmtBDT = (n) => `৳${(Math.round(Number(n) || 0)).toLocaleString('en-US')}`;
const fmtDate = (d) => (d ? dayjs(d).format('MMM D, YYYY') : '—');
const fmtDateTime = (d) => (d ? dayjs(d).format('MMM D, YYYY h:mm A') : '—');

const hexToRgba = (hex, a) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return `rgba(148,163,184,${a})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})`;
};
const statusMeta = (val) => OrderStatusEnum.find((s) => s.value === val) || { label: 'Unknown', color: '#94a3b8' };

// Order ID + Items + Ordered By + Submitted By + Date + Delivery + Total + Status + Action
const HEADERS = [
  { key: 'id', label: 'Order ID', sortable: true, align: 'left', filter: 'id' },
  { key: 'items', label: 'Items', sortable: false, align: 'left' },
  { key: 'orderedBy', label: 'Ordered By', sortable: false, align: 'left', filter: 'orderedBy' },
  { key: 'createdBy', label: 'Submitted By', sortable: false, align: 'left', filter: 'createdBy' },
  { key: 'createdAt', label: 'Date', sortable: true, align: 'left' },
  { key: 'deliveryDate', label: 'Delivery', sortable: true, align: 'left', filter: 'delivery' },
  { key: 'totalAmount', label: 'Total', sortable: true, align: 'right' },
  { key: 'status', label: 'Status', sortable: false, align: 'left', filter: 'status' },
  { key: 'actions', label: 'Action', sortable: false, align: 'left' },
];
const GRID = '40px 150px 74px minmax(150px,1fr) 150px 116px 116px 116px 132px 120px';

// Native select styled to match the design's dark surface.
const selectClass =
  'h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 ' +
  'text-slate-700 dark:text-slate-200 text-xs px-2 outline-none appearance-none cursor-pointer';

function Orders() {
  const axiosClient = useAxiosClient();
  const { user, permissions, darkMode } = useStateContext();
  const navigate = useNavigate();
  const canChangeStatus = canChangeAnyStatus(permissions);
  const settable = settableStatuses(permissions);

  // -- List state --
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current: 1, pageSize: PAGE_SIZE });
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, delivered: 0 });

  // -- Filters / query state --
  const [orderType, setOrderType] = useState('Marketplace');
  // Column-header filters (applied on confirm, like the old table): Order ID, Ordered By, Submitted By.
  const [text, setText] = useState({ id: '', orderedBy: '', createdBy: '' });
  const [statusFilter, setStatusFilter] = useState([]); // multi-select of status values
  const [deliveryRange, setDeliveryRange] = useState(null); // [dayjs, dayjs] on delivery date
  const [openFilterKey, setOpenFilterKey] = useState(null); // which header filter popover is open
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // 'asc' | 'desc'
  const [page, setPage] = useState(1);

  // -- Selection --
  const [selected, setSelected] = useState({});

  // -- Detail panel --
  const [panelId, setPanelId] = useState(null);
  const [panelOrder, setPanelOrder] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);

  const [modal, contextHolder] = Modal.useModal();

  const buildQuery = useCallback(() => {
    const params = { page };
    if (text.id) params.id = text.id;
    if (text.orderedBy) params.orderedBy = text.orderedBy;
    if (text.createdBy) params.createdBy = text.createdBy;
    if (statusFilter.length) params.status = statusFilter.join(',');
    if (deliveryRange && deliveryRange.length === 2) {
      params.startDate = dayjs(deliveryRange[0]).format('YYYY-MM-DD');
      params.endDate = dayjs(deliveryRange[1]).format('YYYY-MM-DD');
    }
    if (sortField && sortOrder) { params.sortField = sortField; params.sortOrder = sortOrder; }
    return Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
  }, [page, text, statusFilter, deliveryRange, sortField, sortOrder]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const base = orderType === 'Marketplace'
      ? `/orders/getMarketplaceOrders/${user.id}?`
      : `/orders/getMerchantOrders?`;
    try {
      const res = await axiosClient.get(`${base}${buildQuery()}`);
      setOrders(res.data.data.map((d) => ({ ...d, key: d.id })));
      setMeta({
        total: res.data.meta.total,
        current: res.data.meta.current_page,
        pageSize: res.data.meta.per_page,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [axiosClient, user.id, orderType, buildQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/orders/getStats/${user.id}`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  }, [axiosClient, user.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Keyboard: Esc closes the panel / clears selection.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (panelId != null) setPanelId(null);
        else if (Object.keys(selected).length) setSelected({});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelId, selected]);

  // -- Filter handlers (reset to page 1) --
  const resetPage = () => setPage(1);
  const changeTab = (type) => { setOrderType(type); setSelected({}); resetPage(); };
  const applyText = (field, v) => { setText((t) => ({ ...t, [field]: v })); resetPage(); setOpenFilterKey(null); };
  const applyStatus = (vals) => { setStatusFilter(vals); resetPage(); setOpenFilterKey(null); };
  const applyDelivery = (range) => { setDeliveryRange(range); resetPage(); setOpenFilterKey(null); };
  const clearOne = (fn) => { fn(); resetPage(); setOpenFilterKey(null); };
  const clearFilters = () => {
    setText({ id: '', orderedBy: '', createdBy: '' });
    setStatusFilter([]);
    setDeliveryRange(null);
    resetPage();
  };
  const hasActiveFilters = !!(text.id || text.orderedBy || text.createdBy || statusFilter.length || deliveryRange);
  const filterActive = (type) => {
    if (type === 'status') return statusFilter.length > 0;
    if (type === 'delivery') return !!deliveryRange;
    return type ? !!text[type] : false;
  };
  const renderFilter = (h) => {
    if (h.filter === 'status') return <StatusFilterDropdown committed={statusFilter} onApply={applyStatus} onReset={() => clearOne(() => setStatusFilter([]))} />;
    if (h.filter === 'delivery') return <DateFilterDropdown committed={deliveryRange} onApply={applyDelivery} onReset={() => clearOne(() => setDeliveryRange(null))} />;
    return <TextFilterDropdown committed={text[h.filter]} placeholder={`Search ${h.label}`} onApply={(v) => applyText(h.filter, v)} onReset={() => clearOne(() => setText((t) => ({ ...t, [h.filter]: '' })))} />;
  };

  const toggleSort = (key) => {
    if (sortField === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(key);
      setSortOrder('asc');
    }
    resetPage();
  };

  // -- Selection handlers --
  const pageIds = orders.map((o) => o.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected[id]);
  const selectedCount = Object.keys(selected).length;
  const toggleSelect = (id) => setSelected((s) => {
    const next = { ...s };
    if (next[id]) delete next[id]; else next[id] = true;
    return next;
  });
  const toggleSelectAll = () => setSelected((s) => {
    const next = { ...s };
    if (allOnPageSelected) pageIds.forEach((id) => delete next[id]);
    else pageIds.forEach((id) => { next[id] = true; });
    return next;
  });

  // -- Row actions --
  const handleNewOrder = (type) => navigate('/orders/orderForm', { state: { orderType: type, update: false } });
  const handleEdit = (record) => navigate('/orders/editOrderForm', { state: { orderType: record.orderType, update: true, order: record } });
  const openFullPage = (id) => navigate(`/orders/${id}`);
  const handleDelete = (record) => modal.confirm({
    title: 'Delete order?',
    content: `Are you sure you want to delete order #${record.id}?`,
    okText: 'Delete',
    okType: 'danger',
    onOk: async () => {
      try {
        const res = await axiosClient.delete(`/orders/delete/${record.id}`);
        toast.warning(res.data.message);
        fetchOrders();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    },
  });

  // -- Bulk actions --
  const bulkSetStatus = (e) => {
    const val = parseInt(e.target.value, 10);
    e.target.value = '';
    if (!val) return;
    const ids = Object.keys(selected);
    const label = statusMeta(val).label;
    modal.confirm({
      title: `Update ${ids.length} order(s) to ${label}?`,
      okText: 'Update',
      onOk: async () => {
        const results = await Promise.allSettled(
          ids.map((id) => axiosClient.post('/orders/updateOrderStatus', { orderId: id, newStatus: val, statusComment: '' }))
        );
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        if (ok) toast.success(`${ok} order(s) updated`);
        if (ok < ids.length) toast.warning(`${ids.length - ok} could not be updated`);
        setSelected({});
        fetchOrders();
        fetchStats();
      },
    });
  };
  const bulkDelete = () => {
    const ids = Object.keys(selected);
    modal.confirm({
      title: `Delete ${ids.length} order(s)?`,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        const results = await Promise.allSettled(ids.map((id) => axiosClient.delete(`/orders/delete/${id}`)));
        const ok = results.filter((r) => r.status === 'fulfilled').length;
        if (ok) toast.warning(`${ok} order(s) deleted`);
        if (ok < ids.length) toast.error(`${ids.length - ok} could not be deleted`);
        setSelected({});
        fetchOrders();
        fetchStats();
      },
    });
  };

  // -- Detail panel --
  const openPanel = useCallback(async (id) => {
    setPanelId(id);
    setPanelOrder(null);
    setPanelLoading(true);
    try {
      const res = await axiosClient.get(`/orders/getOrder/${id}`);
      setPanelOrder(res.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setPanelId(null);
    } finally {
      setPanelLoading(false);
    }
  }, [axiosClient]);
  const closePanel = () => { setPanelId(null); setPanelOrder(null); };

  const changePanelStatus = async (e) => {
    const val = parseInt(e.target.value, 10);
    try {
      await axiosClient.post('/orders/updateOrderStatus', { orderId: panelOrder.id, newStatus: val, statusComment: '' });
      toast.success('Order status updated');
      const res = await axiosClient.get(`/orders/getOrder/${panelOrder.id}`);
      setPanelOrder(res.data.data);
      fetchOrders();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // -- Derived view data --
  const kpis = [
    { label: 'Total Orders', value: stats.total, tint: '#3b82f6', icon: <ShoppingOutlined /> },
    { label: 'Pending', value: stats.pending, tint: '#f59e0b', icon: <ClockCircleOutlined /> },
    { label: 'Processing', value: stats.processing, tint: '#06b6d4', icon: <SyncOutlined /> },
    { label: 'Delivered', value: stats.delivered, tint: '#10b981', icon: <CheckCircleOutlined /> },
  ];
  const tabs = [{ key: 'Marketplace', label: 'Marketplace' }];
  if (permissions.includes('VIEW_MERCHANTS')) tabs.push({ key: 'Merchant', label: 'Merchant' });

  const totalPages = Math.max(1, Math.ceil(meta.total / (meta.pageSize || PAGE_SIZE)));
  const rangeStart = meta.total === 0 ? 0 : (page - 1) * (meta.pageSize || PAGE_SIZE) + 1;
  const rangeEnd = Math.min(page * (meta.pageSize || PAGE_SIZE), meta.total);

  const showEmpty = !loading && orders.length === 0;
  const showRows = !loading && orders.length > 0;

  return (
    <div className="animate-fade-in px-1 flex flex-col gap-4 h-full min-h-0">

      {/* Page title row */}
      <div className="flex items-center justify-between flex-wrap gap-3.5">
        <div>
          <div className="text-[22px] font-bold text-slate-900 dark:text-white">Orders</div>
          <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            {stats.total.toLocaleString()} orders across marketplace and merchant channels
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Permission required={'EXPORT_ORDERS'}>
            <ExportOrderExcel />
          </Permission>
          <Permission required={'CREATE_MERCHANT_ORDER'}>
            <button
              onClick={() => handleNewOrder(OrderTypeEnum.MERCHANT)}
              className="h-[38px] px-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-200 text-[13px] font-semibold cursor-pointer">
              Merchant Order
            </button>
          </Permission>
          <Permission required={'CREATE_MARKETPLACE_ORDER'}>
            <button
              onClick={() => handleNewOrder(OrderTypeEnum.MARKETPLACE)}
              className="h-[38px] px-[18px] rounded-lg border-none bg-[#007AFF] text-white text-[13px] font-bold cursor-pointer flex items-center gap-1.5 shadow-sm">
              + New Order
            </button>
          </Permission>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-[13px]"
                style={{ background: hexToRgba(k.tint, 0.14), color: k.tint }}>
                {k.icon}
              </span>
              <span className="text-[12.5px] text-slate-500 dark:text-slate-400 font-semibold">{k.label}</span>
            </div>
            <div className="text-[24px] font-bold text-slate-900 dark:text-white font-mono">
              {Number(k.value || 0).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Main panel */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Tabs */}
        <div className="flex items-center justify-between px-[18px] pt-3.5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex gap-6">
            {tabs.map((t) => {
              const active = orderType === t.key;
              return (
                <div
                  key={t.key}
                  onClick={() => changeTab(t.key)}
                  className={`pb-3 border-b-2 text-[13.5px] font-semibold cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'border-[#007AFF] text-slate-900 dark:text-white'
                      : 'border-transparent text-slate-500 dark:text-slate-400'
                  }`}>
                  {t.label}
                  {active && (
                    <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-[7px] py-px rounded-[9px]">
                      {meta.total}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bulk action bar — only when a selection exists */}
        {selectedCount > 0 && (
          <div className="px-[18px] py-3 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-blue-50 dark:bg-blue-500/[0.06]">
            <div className="flex items-center gap-3.5">
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{selectedCount} selected</span>
              <button onClick={() => setSelected({})} className="text-[12.5px] text-[#007AFF] bg-none border-none cursor-pointer font-semibold">Clear</button>
            </div>
            <div className="flex items-center gap-2">
              {canChangeStatus && (
                <select defaultValue="" onChange={bulkSetStatus} className={selectClass} style={{ colorScheme: darkMode ? 'dark' : 'light' }}>
                  <option value="">Set status…</option>
                  {settable.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              )}
              <Permission required={'DELETE_ORDER'}>
                <button onClick={bulkDelete} className="h-8 px-3 rounded-md border border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 text-[12.5px] font-semibold cursor-pointer">Delete</button>
              </Permission>
            </div>
          </div>
        )}

        {/* Table (scrolls internally; header stays pinned) */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div style={{ minWidth: 1100 }}>
            {/* Header row */}
            <div
              className="grid sticky top-0 z-[5] bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700"
              style={{ gridTemplateColumns: GRID }}>
              <div className="py-[11px] px-2 flex items-center justify-center">
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="w-[15px] h-[15px] accent-[#007AFF]" />
              </div>
              {HEADERS.map((h) => {
                const active = filterActive(h.filter);
                return (
                  <div
                    key={h.key}
                    className={`py-[11px] px-2.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1 ${
                      h.align === 'right' ? 'justify-end' : ''
                    }`}>
                    <span onClick={h.sortable ? () => toggleSort(h.key) : undefined} className={`flex items-center gap-1 ${h.sortable ? 'cursor-pointer' : ''}`}>
                      {h.label}
                      {h.sortable && sortField === h.key && (
                        <span className="text-[#007AFF] text-[10px]">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                    {h.filter && (
                      <Popover
                        trigger="click"
                        placement="bottom"
                        open={openFilterKey === h.key}
                        onOpenChange={(o) => setOpenFilterKey(o ? h.key : null)}
                        content={renderFilter(h)}>
                        <span
                          onClick={(e) => e.stopPropagation()}
                          title="Filter"
                          className={`ml-auto cursor-pointer px-0.5 ${active ? 'text-[#007AFF]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                          {h.filter === 'status' ? <FilterOutlined /> : h.filter === 'delivery' ? <CalendarOutlined /> : <SearchOutlined />}
                        </span>
                      </Popover>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Loading skeleton */}
            {loading && [...Array(7)].map((_, r) => (
              <div key={r} className="grid border-b border-slate-200 dark:border-slate-700 py-3.5" style={{ gridTemplateColumns: GRID }}>
                <div />
                {[60, 50, 120, 100, 70, 70, 80, 90, 70].map((w, i) => (
                  <div key={i} className="px-2.5 flex items-center">
                    <div className="h-3 rounded bg-slate-100 dark:bg-slate-700 animate-pulse" style={{ width: w }} />
                  </div>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {showEmpty && (
              <div className="py-16 px-6 flex flex-col items-center gap-2.5 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[22px] text-slate-400">📭</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">No orders match your filters</div>
                <div className="text-[12.5px] text-slate-500 dark:text-slate-400">Try adjusting search, status, or date range.</div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="mt-1.5 h-[34px] px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-[12.5px] font-semibold cursor-pointer">Clear filters</button>
                )}
              </div>
            )}

            {/* Rows */}
            {showRows && orders.map((o) => {
              const st = statusMeta(o.status);
              const avatarBg = AVATARS[o.id % AVATARS.length];
              return (
                <div
                  key={o.id}
                  className="grid border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
                  style={{ gridTemplateColumns: GRID }}>
                  <div className="py-3 px-2 flex items-center justify-center">
                    <input type="checkbox" checked={!!selected[o.id]} onChange={() => toggleSelect(o.id)} className="w-[15px] h-[15px] accent-[#007AFF]" />
                  </div>
                  <div onClick={() => openFullPage(o.id)} title="Open full details page" className="py-3 px-2.5 flex items-center font-mono text-[12.5px] text-[#007AFF] font-semibold cursor-pointer truncate hover:underline">
                    #{o.id}
                  </div>
                  <div className="py-3 px-2.5 flex items-center text-[12.5px] text-slate-500 dark:text-slate-400">
                    {o.itemsCount || 0} {o.itemsCount === 1 ? 'item' : 'items'}
                  </div>
                  <div className="py-3 px-2.5 flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-full text-white text-[10.5px] font-bold flex items-center justify-center flex-shrink-0" style={{ background: avatarBg }}>
                      {o.orderedBy ? o.orderedBy.charAt(0).toUpperCase() : '?'}
                    </span>
                    <span className="text-[13px] text-slate-900 dark:text-slate-100 font-medium truncate">{o.orderedBy}</span>
                  </div>
                  <div className="py-3 px-2.5 flex items-center text-[12.5px] text-slate-500 dark:text-slate-400 truncate">{o.createdBy}</div>
                  <div className="py-3 px-2.5 flex items-center text-[12.5px] text-slate-900 dark:text-slate-100">{fmtDate(o.createdAt)}</div>
                  <div className="py-3 px-2.5 flex items-center text-[12.5px] text-slate-900 dark:text-slate-100">{fmtDate(o.deliveryDate)}</div>
                  <div className="py-3 px-2.5 flex items-center justify-end text-[13px] text-slate-900 dark:text-slate-100 font-semibold font-mono">{fmtBDT(o.totalAmount)}</div>
                  <div className="py-3 px-2.5 flex items-center">
                    <span
                      className="text-[11.5px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5"
                      style={{ color: st.color, background: hexToRgba(st.color, 0.14) }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.color }} />
                      {st.label}
                    </span>
                  </div>
                  <div className="py-3 px-2.5 flex items-center gap-1">
                    <button onClick={() => openPanel(o.id)} title="View" className="w-7 h-7 rounded-md border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer flex items-center justify-center">
                      <EyeOutlined />
                    </button>
                    <Permission required={'EDIT_ORDER'}>
                      <button onClick={() => handleEdit(o)} title="Edit" className="w-7 h-7 rounded-md border-none bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white cursor-pointer flex items-center justify-center">
                        <EditOutlined />
                      </button>
                    </Permission>
                    <Permission required={'DELETE_ORDER'}>
                      <button onClick={() => handleDelete(o)} title="Delete" className="w-7 h-7 rounded-md border-none bg-transparent text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 cursor-pointer flex items-center justify-center">
                        <DeleteOutlined />
                      </button>
                    </Permission>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination — right padding keeps the Next button clear of the floating chat button */}
        <div className="pl-[18px] pr-[92px] py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {meta.total === 0 ? '0 results' : `Showing ${rangeStart}-${rangeEnd} of ${meta.total}`}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-[30px] px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold disabled:text-slate-300 dark:disabled:text-slate-600 text-slate-700 dark:text-slate-200 disabled:cursor-default cursor-pointer">
              Prev
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 px-1.5">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-[30px] px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold disabled:text-slate-300 dark:disabled:text-slate-600 text-slate-700 dark:text-slate-200 disabled:cursor-default cursor-pointer">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out detail panel */}
      {panelId != null && (
        <>
          <div onClick={closePanel} className="fixed inset-0 bg-black/50 z-[90]" style={{ animation: 'fadein .15s ease-out' }} />
          <div className="fixed top-0 right-0 h-full w-full max-w-[460px] bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 z-[95] flex flex-col shadow-2xl" style={{ animation: 'slidein .2s ease-out' }}>
            {panelLoading || !panelOrder ? (
              <div className="p-6"><Skeleton active paragraph={{ rows: 10 }} /></div>
            ) : (
              <OrderPanel
                order={panelOrder}
                settable={settable}
                canChangeStatus={canChangeStatus}
                onClose={closePanel}
                onChangeStatus={changePanelStatus}
                onOpenFullPage={() => openFullPage(panelOrder.id)}
                darkMode={darkMode}
              />
            )}
          </div>
        </>
      )}

      {contextHolder}
    </div>
  );
}

// -- Detail panel body --
function OrderPanel({ order, settable = [], canChangeStatus, onClose, onChangeStatus, onOpenFullPage, darkMode }) {
  const st = statusMeta(order.status);
  // Always show the order's current status, even if the user can't set it, plus
  // the statuses they may move it to.
  const statusOptions = settable.some((s) => s.value === order.status)
    ? settable
    : [statusMeta(order.status), ...settable];
  const isMerchant = !order.customer;
  const products = order.products || [];
  const timeline = [...(order.orderStatusChanges || [])].reverse();
  const customerAddress = order.customer
    ? [order.customer.address?.address, order.customer.address?.upazila?.name, order.customer.address?.district?.name].filter(Boolean).join(', ')
    : '';

  return (
    <>
      <div className="px-5 py-[18px] border-b border-slate-200 dark:border-slate-700 flex items-start justify-between">
        <div>
          <div className="text-[16px] font-bold text-slate-900 dark:text-white font-mono">#{order.id}</div>
          <div className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">{order.orderable?.name} · {fmtDateTime(order.createdAt)}</div>
          <button onClick={onOpenFullPage} className="mt-1.5 text-[12px] text-[#007AFF] font-semibold bg-none border-none cursor-pointer p-0 flex items-center gap-1">
            Open full details page <ArrowRightOutlined className="text-[10px]" />
          </button>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-md border-none bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 cursor-pointer flex items-center justify-center">
          <CloseOutlined />
        </button>
      </div>

      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
        <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
        <select
          value={order.status}
          onChange={onChangeStatus}
          disabled={!canChangeStatus}
          className="h-[30px] rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[12.5px] font-bold px-2 outline-none disabled:cursor-not-allowed cursor-pointer"
          style={{ color: st.color, colorScheme: darkMode ? 'dark' : 'light' }}>
          {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-[18px] flex flex-col gap-[18px]">
        {/* Items */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Items</div>
          <div className="flex flex-col gap-2">
            {products.map((p) => (
              <div key={p.id} className="flex gap-2.5 p-2.5 border border-slate-200 dark:border-slate-700 rounded-[10px]">
                <div className="w-10 h-10 rounded-[7px] bg-slate-200 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-[13px] flex-shrink-0 overflow-hidden">
                  {p.fabrics?.image
                    ? <img src={`${API}/files/upload/${p.fabrics.image}`} alt="" className="w-full h-full object-cover" />
                    : (p.productType?.name?.[0] || '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{p.productType?.name}</span>
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">{fmtBDT(p.price)}</span>
                  </div>
                  <div className="text-[11.5px] text-[#007AFF]">
                    {[p.fabrics?.name, p.fabricType?.name].filter(Boolean).join(' · ')} · Qty {p.unit}
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && <div className="text-[12.5px] text-slate-400">No items.</div>}
          </div>
        </div>

        {/* Customer / Merchant */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">{isMerchant ? 'Merchant' : 'Customer'}</div>
          {isMerchant ? (
            <>
              <div className="text-[13px] text-slate-900 dark:text-white font-semibold">{order.orderable?.name}</div>
              {order.merchantRef && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ref: {order.merchantRef}</div>}
            </>
          ) : (
            <>
              <div className="text-[13px] text-slate-900 dark:text-white font-semibold">{order.customer?.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{customerAddress}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{order.customer?.address?.phone}</div>
            </>
          )}
        </div>

        {/* Delivery */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Delivery</div>
          <div className="text-[12.5px] text-slate-900 dark:text-white">{order.deliveryChannel?.name || '—'} · {fmtDate(order.deliveryDate)}</div>
        </div>

        {/* Payment */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Payment</div>
          <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white"><span>Subtotal</span><span>{fmtBDT(order.payment?.amount)}</span></div>
          <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white mt-0.5"><span>Delivery</span><span>{fmtBDT(order.payment?.deliveryCharge)}</span></div>
          <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
          <div className="flex justify-between text-[15px] font-bold text-slate-900 dark:text-white"><span>Total</span><span>{fmtBDT(order.payment?.totalAmount)}</span></div>
        </div>

        {/* History */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">History</div>
          {timeline.length ? timeline.map((t, i) => {
            const info = statusMeta(t.status);
            return (
              <div key={i} className="flex gap-2.5 py-2 border-b border-slate-200 dark:border-slate-700">
                <div className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0" style={{ background: info.color }} />
                <div>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[10.5px] font-bold" style={{ color: info.color }}>{info.label}</span>
                    <span className="text-[10.5px] text-slate-500 dark:text-slate-400">{fmtDateTime(t.created_at)}</span>
                  </div>
                  {t.comment && <div className="text-xs text-slate-900 dark:text-white mt-0.5">{t.comment}</div>}
                </div>
              </div>
            );
          }) : <div className="text-[12.5px] text-slate-400">No history yet.</div>}
        </div>

        <PDFDownloadLink document={<OrderInvoice order={order} />} fileName={`order-${order.id}-${dayjs().unix()}.pdf`}>
          {({ loading }) => (
            <button className="h-10 w-full rounded-[9px] border-[1.5px] border-dashed border-[#007AFF] bg-transparent text-[#007AFF] text-[12.5px] font-bold cursor-pointer flex items-center justify-center gap-1.5">
              <DownloadOutlined /> {loading ? 'Preparing…' : 'Download PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </>
  );
}

// -- Column-header filter dropdowns (apply on confirm, like the old AntD table) --
function TextFilterDropdown({ committed, placeholder, onApply, onReset }) {
  const [val, setVal] = React.useState(committed || '');
  React.useEffect(() => { setVal(committed || ''); }, [committed]);
  return (
    <div style={{ width: 200 }} className="p-1" onKeyDown={(e) => e.stopPropagation()}>
      <Input
        autoFocus
        size="small"
        placeholder={placeholder}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onPressEnter={() => onApply(val.trim())}
        className="mb-2"
      />
      <div className="flex gap-2">
        <Button type="primary" size="small" icon={<SearchOutlined />} onClick={() => onApply(val.trim())} className="flex-1">Search</Button>
        <Button size="small" onClick={onReset} className="flex-1">Reset</Button>
      </div>
    </div>
  );
}

function StatusFilterDropdown({ committed, onApply, onReset }) {
  const [vals, setVals] = React.useState(committed || []);
  React.useEffect(() => { setVals(committed || []); }, [committed]);
  return (
    <div style={{ width: 170 }} className="p-1">
      <Checkbox.Group value={vals} onChange={setVals} className="flex flex-col gap-1.5 mb-2 max-h-[260px] overflow-y-auto">
        {OrderStatusEnum.map((s) => <Checkbox key={s.value} value={s.value}>{s.label}</Checkbox>)}
      </Checkbox.Group>
      <div className="flex gap-2">
        <Button type="primary" size="small" onClick={() => onApply(vals)} className="flex-1">OK</Button>
        <Button size="small" onClick={onReset} className="flex-1">Reset</Button>
      </div>
    </div>
  );
}

function DateFilterDropdown({ committed, onApply, onReset }) {
  const [range, setRange] = React.useState(committed || null);
  React.useEffect(() => { setRange(committed || null); }, [committed]);
  return (
    <div className="p-1">
      <DatePicker.RangePicker size="small" value={range} onChange={setRange} className="mb-2 flex" />
      <div className="flex gap-2">
        <Button type="primary" size="small" icon={<SearchOutlined />} onClick={() => onApply(range)} className="flex-1">Filter</Button>
        <Button size="small" onClick={onReset} className="flex-1">Reset</Button>
      </div>
    </div>
  );
}

export default Orders;
