import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, Image, Input, Modal, Select, Skeleton, Tag } from 'antd';
import { DownloadOutlined, QrcodeOutlined } from '@ant-design/icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import useAxiosClient from "../axios-client.js";
import { useStateContext } from "../contexts/ContextProvider";
import OrderInvoice from "../components/OrderInvoice/OrderInvoice";
import OrderQrLabel from "../components/OrderInvoice/OrderQrLabel";
import { extractOrderNumber } from "../components/Util/OrderNumberFormatter";
import { OrderStatusEnum, settableStatuses, canChangeAnyStatus } from "../utils/enums/OrderStatusEnum";

const fmtBDT = (n) => `৳${(Math.round(Number(n) || 0)).toLocaleString('en-US')}`;
const MAIN_FLOW = [1, 2, 3, 4, 5, 6]; // DRAFT → DELIVERED
const API = process.env.REACT_APP_API_BASE_URL;
const CARD_SHADOW = '0 1px 2px rgba(15,23,42,.04), 0 6px 20px rgba(15,23,42,.06)';

const Order = () => {
    const axiosClient = useAxiosClient();
    const { permissions } = useStateContext();
    const canPull = permissions?.includes('PULL_FROM_STOCK');
    const canReturn = permissions?.includes('RETURN_ORDER');
    const canChangeStatus = canChangeAnyStatus(permissions);
    const ELIGIBLE_STATUSES = [1, 2, 9]; // DRAFT, APPROVED, BOOKING

    const [order, setOrder] = useState({});
    const [activeTab, setActiveTab] = useState('items');
    const [returnOpen, setReturnOpen] = useState(false);
    const [returnSelections, setReturnSelections] = useState({});
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [statusComment, setStatusComment] = useState('');
    const [cancelSelections, setCancelSelections] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    const fetchOrders = useCallback(async () => {
        try {
            const res = await axiosClient.get(`/orders/getOrder/${extractOrderNumber(id)}`);
            setOrder({ ...res.data.data });
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            navigate('/notFound');
        }
    }, [axiosClient, id, navigate]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handlePull = async (item) => {
        try {
            const res = await axiosClient.post(`/orders/pullFromStock/${order.id}/${item.id}`);
            toast.success(res.data.message);
            fetchOrders();
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const submitReturns = async () => {
        const lines = Object.entries(returnSelections).filter(([, c]) => c).map(([pid, c]) => ({ productId: Number(pid), condition: c }));
        if (!lines.length) {
            toast.warning('Set at least one product to Sellable or Damaged before recording the return.');
            return;
        }
        try {
            const res = await axiosClient.post(`/orders/markReturned/${order.id}`, { lines });
            toast.success(res.data.message);
            setReturnOpen(false);
            setReturnSelections({});
            fetchOrders();
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    const openStatusModal = () => {
        if (!canChangeStatus) return;
        setPendingStatus(order.status);
        setStatusComment('');
        setCancelSelections({});
        setStatusModalOpen(true);
    };
    const confirmStatusChange = async () => {
        try {
            if (pendingStatus === 8) {
                const lines = Object.entries(cancelSelections).filter(([, c]) => c).map(([pid, c]) => ({ productId: Number(pid), condition: c }));
                const res = await axiosClient.post(`/orders/cancelOrder/${order.id}`, { comment: statusComment, lines });
                toast.success(res.data.message);
            } else {
                await axiosClient.post('/orders/updateOrderStatus', { orderId: order.id, newStatus: pendingStatus, statusComment });
                toast.success('Order status updated');
            }
            setStatusModalOpen(false);
            fetchOrders();
        } catch (e) { toast.error(e.response?.data?.message || e.message); }
    };

    if (!order.id) {
        return <div className="max-w-6xl mx-auto p-4 md:p-6"><Skeleton active paragraph={{ rows: 8 }} /></div>;
    }

    const statusInfo = OrderStatusEnum.find(s => s.value === order.status) || OrderStatusEnum[0];
    // Status modal offers only the statuses the user may set (ADR 0004), always
    // including the current one so it displays.
    const settableForModal = settableStatuses(permissions);
    const statusModalOptions = (settableForModal.some(s => s.value === order.status)
        ? settableForModal
        : [statusInfo, ...settableForModal]).map(s => ({ value: s.value, label: s.label }));
    const isMerchant = !order.customer;
    const products = order.products || [];
    const timeline = [...(order.orderStatusChanges || [])].reverse();
    const steps = MAIN_FLOW.map((val, i) => {
        const info = OrderStatusEnum.find(s => s.value === val);
        const done = val < order.status;
        const current = val === order.status;
        return {
            label: info.label,
            mark: done ? '✓' : String(i + 1),
            circleBg: done ? '#10b981' : current ? info.color : '#cbd5e1',
            active: done || current,
            hasLine: i < MAIN_FLOW.length - 1,
            lineDone: done,
        };
    });

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col gap-4" style={{ boxShadow: CARD_SHADOW }}>

                {/* Header */}
                <div className="flex flex-wrap justify-between gap-3.5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Order #{order.id}</span>
                            <span onClick={openStatusModal}
                                className="text-[11.5px] font-bold text-white px-2.5 py-1 rounded-xl"
                                style={{ background: statusInfo.color, cursor: canChangeStatus ? 'pointer' : 'default' }}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <div className="text-[13px] text-slate-500 dark:text-slate-400">
                            {order.orderable?.name || '—'} · {dayjs(order.createdAt).format('MMM D, YYYY')}
                        </div>
                    </div>
                    <div className="flex gap-2 self-start">
                        <PDFDownloadLink document={<OrderInvoice order={order} />} fileName={`order-${order.id}-${dayjs().unix()}.pdf`}>
                            {({ loading }) => (
                                <Button icon={<DownloadOutlined />} loading={loading}
                                    className="!h-[38px] !border-[1.5px] !border-dashed !border-[#007AFF] !text-[#007AFF] !bg-transparent !font-bold">
                                    Download PDF
                                </Button>
                            )}
                        </PDFDownloadLink>
                        <PDFDownloadLink document={<OrderQrLabel order={order} />} fileName={`order-${order.id}-label.pdf`}>
                            {({ loading }) => (
                                <Button icon={<QrcodeOutlined />} loading={loading}
                                    className="!h-[38px] !border-[1.5px] !border-dashed !border-slate-300 dark:!border-slate-600 !text-slate-600 dark:!text-slate-300 !bg-transparent !font-bold">
                                    QR label
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </div>

                {/* Status stepper */}
                <div className="flex items-center overflow-x-auto py-1">
                    {steps.map((st, i) => (
                        <div key={i} className="flex items-center flex-shrink-0">
                            <div className="flex flex-col items-center gap-1.5 min-w-[64px]">
                                <div className="w-[22px] h-[22px] rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ background: st.circleBg }}>{st.mark}</div>
                                <div className={`text-[10.5px] font-semibold whitespace-nowrap ${st.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{st.label}</div>
                            </div>
                            {st.hasLine && <div className="w-[34px] h-0.5 mb-4 mx-0.5 flex-shrink-0" style={{ background: st.lineDone ? '#10b981' : '#e2e8f0' }} />}
                        </div>
                    ))}
                </div>

                {/* Two-column body */}
                <div className="flex gap-5 flex-wrap items-start">

                    {/* Left: tabbed content */}
                    <div className="flex-1 min-w-[320px] flex flex-col">
                        <div className="flex gap-1 bg-slate-50 dark:bg-slate-900 rounded-[10px] p-[3px] w-fit mb-3">
                            {[{ k: 'items', l: 'Items' }, { k: 'timeline', l: 'History' }, { k: 'attachments', l: 'Attachments' }].map(t => (
                                <div key={t.k} onClick={() => setActiveTab(t.k)}
                                    className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold cursor-pointer transition-colors ${activeTab === t.k ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {t.l}
                                </div>
                            ))}
                        </div>

                        {activeTab === 'items' && (
                            <div className="flex flex-col gap-2.5">
                                {canReturn && order.status === 6 && (
                                    <div className="flex justify-end">
                                        <Button danger size="small" onClick={() => setReturnOpen(true)}>Mark returned</Button>
                                    </div>
                                )}
                                {products.map((p) => (
                                    <div key={p.id} className="flex gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-[13px]">
                                            {p.fabrics?.image
                                                ? <img src={`${API}/files/upload/${p.fabrics.image}`} alt="" className="w-full h-full object-cover" />
                                                : (p.productType?.name?.[0] || '?')}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between gap-2">
                                                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white">{p.productType?.name}</div>
                                                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white">{fmtBDT(p.price)}</div>
                                            </div>
                                            <div className="text-[11.5px] text-[#007AFF] font-semibold">
                                                {p.fabrics?.name}{p.fabricType?.name ? ` · ${p.fabricType.name}` : ''}
                                            </div>
                                            <div className="text-[12px] text-slate-500 dark:text-slate-400">{p.description || 'No description'} · Qty {p.unit}</div>
                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                {p.fulfilledFromStock && <Tag color="green">Fulfilled from stock</Tag>}
                                                {p.isReturned && <Tag color={p.returnCondition === 'SELLABLE' ? 'gold' : 'red'}>Returned ({p.returnCondition})</Tag>}
                                                {!p.fulfilledFromStock && ELIGIBLE_STATUSES.includes(order.status) && p.availableInStock > 0 && (
                                                    <>
                                                        <Tag color="green">{p.availableInStock} in ready stock</Tag>
                                                        {canPull && <Button size="small" type="link" className="!px-0" onClick={() => handlePull(p)}>Pull from stock</Button>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="flex flex-col">
                                {timeline.length ? timeline.map((t, i) => {
                                    const info = OrderStatusEnum.find(s => s.value === t.status) || {};
                                    return (
                                        <div key={i} className="flex gap-2.5 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: info.color }} />
                                            <div>
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <span className="text-[11.5px] font-bold text-white px-2 py-0.5 rounded-[10px]" style={{ background: info.color }}>{info.label}</span>
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{dayjs(t.created_at).format('MMM D, YYYY h:mm A')}</span>
                                                </div>
                                                {t.comment && <div className="text-[12.5px] text-slate-900 dark:text-white mt-1">{t.comment}</div>}
                                                {t.user && <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">by {t.user.firstname}</div>}
                                            </div>
                                        </div>
                                    );
                                }) : <div className="text-[12.5px] text-slate-400 py-4">No history yet.</div>}
                            </div>
                        )}

                        {activeTab === 'attachments' && (
                            (order.images && order.images.length) ? (
                                <div className="flex flex-wrap gap-2.5">
                                    {order.images.map(img => (
                                        <Image
                                            key={img.id}
                                            width={132}
                                            height={132}
                                            src={`${API}/files/upload/${img.id}`}
                                            className="!border !border-slate-200 dark:!border-slate-700"
                                            style={{ objectFit: 'cover', borderRadius: 10 }}
                                            preview={{ mask: 'View' }}
                                        />
                                    ))}
                                </div>
                            ) : <div className="text-[12.5px] text-slate-400 py-4">No attachments.</div>
                        )}
                    </div>

                    {/* Right: summary panel */}
                    <div className="w-[280px] flex-shrink-0 min-w-[240px] bg-slate-50 dark:bg-slate-900 rounded-[14px] p-4 flex flex-col gap-3">
                        <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">{isMerchant ? 'Merchant' : 'Customer'}</div>
                            {isMerchant ? (
                                <>
                                    <div className="text-[13.5px] font-bold text-slate-900 dark:text-white">{order.orderable?.name}</div>
                                    {order.merchantRef && <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Ref: {order.merchantRef}</div>}
                                </>
                            ) : (
                                <>
                                    <div className="text-[13.5px] font-bold text-slate-900 dark:text-white">{order.customer?.name}</div>
                                    <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        {[order.customer?.address?.address, order.customer?.address?.upazila?.name, order.customer?.address?.district?.name].filter(Boolean).join(', ')}
                                    </div>
                                    <div className="text-[12px] text-slate-500 dark:text-slate-400">{order.customer?.address?.phone}</div>
                                </>
                            )}
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                        <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Delivery</div>
                            <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white"><span>Channel</span><span className="font-semibold">{order.deliveryChannel?.name || '—'}</span></div>
                            <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white mt-1"><span>Date</span><span className="font-semibold">{dayjs(order.deliveryDate).format('MMM D, YYYY')}</span></div>
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-700" />
                        <div>
                            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Payment</div>
                            <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white"><span>Subtotal</span><span>{fmtBDT(order.payment?.amount)}</span></div>
                            <div className="flex justify-between text-[12.5px] text-slate-900 dark:text-white mt-1"><span>Delivery</span><span>{fmtBDT(order.payment?.deliveryCharge)}</span></div>
                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                            <div className="flex justify-between text-[15px] font-bold text-slate-900 dark:text-white"><span>Total</span><span>{fmtBDT(order.payment?.totalAmount)}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status modal */}
            <Modal title="Update order status" open={statusModalOpen} onOk={confirmStatusChange} onCancel={() => setStatusModalOpen(false)} okText="Update status">
                <div className="flex flex-col gap-3 mt-2">
                    <Select value={pendingStatus} onChange={setPendingStatus} options={statusModalOptions} />
                    <Input.TextArea rows={3} placeholder="Comment (optional)" value={statusComment} onChange={(e) => setStatusComment(e.target.value)} />

                    {pendingStatus === 8 && [3, 4, 5].includes(order.status) && (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                            <div className="text-slate-500 text-sm mb-2">This order was already produced. Mark which finished items go to ready stock (Sellable), or Damaged to discard.</div>
                            <div className="flex flex-col gap-2">
                                {products.map(p => (
                                    <div key={p.id} className="flex items-center justify-between gap-3">
                                        <span className="text-sm">{p.productType?.name} · {p.fabrics?.name} · Qty {p.unit}</span>
                                        <Select allowClear style={{ width: 150 }} placeholder="Not restocked" value={cancelSelections[p.id]}
                                            onChange={(v) => setCancelSelections(prev => ({ ...prev, [p.id]: v }))}
                                            options={[{ value: 'SELLABLE', label: 'Sellable' }, { value: 'DAMAGED', label: 'Damaged' }]} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Returns modal */}
            <Modal title="Mark lines as returned" open={returnOpen} onOk={submitReturns} onCancel={() => setReturnOpen(false)} okText="Record return" okButtonProps={{ danger: true }}>
                <div className="text-slate-500 text-sm">Set each returned line to <b>Sellable</b> or <b>Damaged</b> (leave others as “Not returned”). Sellable lines are added to ready stock.</div>
                <div className="flex flex-col gap-3 mt-3">
                    {products.length === 0 && <div className="text-slate-400 text-sm">This order has no products.</div>}
                    {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-3">
                            <span className="text-sm">{p.productType?.name} · {p.fabrics?.name} · Qty {p.unit}</span>
                            {p.isReturned ? (
                                <Tag color={p.returnCondition === 'SELLABLE' ? 'gold' : 'red'}>Returned ({p.returnCondition})</Tag>
                            ) : (
                                <Select allowClear style={{ width: 150 }} placeholder="Not returned" value={returnSelections[p.id]}
                                    onChange={(v) => setReturnSelections(prev => ({ ...prev, [p.id]: v }))}
                                    options={[{ value: 'SELLABLE', label: 'Sellable' }, { value: 'DAMAGED', label: 'Damaged' }]} />
                            )}
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default Order;
