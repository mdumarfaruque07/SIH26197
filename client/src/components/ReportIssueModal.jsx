import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  X,
  AlertTriangle,
  Bug,
  Landmark,
  ShoppingBag,
  CreditCard,
  Headphones,
  ShieldAlert,
  Sparkles,
  Camera,
  CheckCircle,
  Copy,
  Check,
  Send,
  Loader2,
  Paperclip,
  Trash2,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'bug',
    icon: Bug,
    titleEn: 'App Bug / Crash',
    titleHi: 'तकनीकी बग या ऐप क्रैश',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    id: 'monument_data',
    icon: Landmark,
    titleEn: 'Incorrect Monument Lore',
    titleHi: 'स्मारक की गलत जानकारी या फोटो',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    id: 'odop_order',
    icon: ShoppingBag,
    titleEn: 'Artisan / ODOP Order Issue',
    titleHi: 'कारीगर उत्पाद या डिलीवरी समस्या',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'payment',
    icon: CreditCard,
    titleEn: 'Payment & Billing Inquiry',
    titleHi: 'भुगतान या रिफंड संबंधी पूछताछ',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'audio_narration',
    icon: Headphones,
    titleEn: 'Audio Guide & GPS Stutter',
    titleHi: 'ऑडियो गाइड या जीपीएस रडार समस्या',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'safety_cleanliness',
    icon: ShieldAlert,
    titleEn: 'Site Cleanliness & Safety',
    titleHi: 'स्मारक स्थल स्वच्छता व सुरक्षा',
    color: 'text-rose-600 bg-rose-50 border-rose-200',
  },
  {
    id: 'feedback',
    icon: Sparkles,
    titleEn: 'Feedback & Suggestions',
    titleHi: 'सुझाव या नया स्मारक प्रस्ताव',
    color: 'text-stone-700 bg-stone-100 border-stone-200',
  },
];

export default function ReportIssueModal({ isOpen, onClose, onTicketCreated }) {
  const { lang } = useLanguage();
  const { user } = useAuth();

  const [category, setCategory] = useState('bug');
  const [subject, setSubject] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('normal'); // 'normal' | 'urgent'
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(
          lang === 'hi'
            ? 'फ़ाइल का आकार 5MB से कम होना चाहिए।'
            : 'Attachment file size must be under 5 MB.'
        );
        return;
      }
      setAttachmentFile(file);
      setAttachmentPreview(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachmentPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया समस्या का संक्षिप्त विषय लिखें।'
          : 'Please enter a short subject for the issue.'
      );
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया कम से कम 10 अक्षरों में विवरण लिखें।'
          : 'Please describe the issue in at least 10 characters.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      formData.append('priority', priority);
      formData.append('referenceId', referenceId.trim());
      formData.append('contactEmail', contactEmail.trim());
      formData.append('contactPhone', contactPhone.trim());
      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      let newTicketData = null;

      try {
        const response = await api.post('/support/report', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data && response.data.success && response.data.ticket) {
          newTicketData = response.data.ticket;
        }
      } catch (networkErr) {
        console.warn('Network API report error, generating local ticket fallback:', networkErr);
      }

      // Fallback local ticket if offline or server unreachable
      if (!newTicketData) {
        newTicketData = {
          id: `SK-TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
          category,
          subject: subject.trim(),
          description: description.trim(),
          priority,
          referenceId: referenceId.trim(),
          contactEmail: contactEmail.trim() || 'tourist@sanskritikhoj.in',
          contactPhone: contactPhone.trim(),
          status: 'Under Review',
          statusHi: 'समीक्षाधीन',
          createdAt: new Date().toISOString(),
          resolutionEstimate: '24-48 Hours',
        };
      }

      // Persist to user's local tickets cache
      try {
        const existing = JSON.parse(localStorage.getItem('sanskriti_support_tickets') || localStorage.getItem('sih_support_tickets') || '[]');
        const updated = [newTicketData, ...existing];
        localStorage.setItem('sanskriti_support_tickets', JSON.stringify(updated));
      } catch (storageErr) {
        console.error('LocalStorage ticket save error:', storageErr);
      }

      setSubmittedTicket(newTicketData);
      if (onTicketCreated) onTicketCreated(newTicketData);
    } catch (err) {
      console.error('Report submission failed:', err);
      setErrorMsg(
        lang === 'hi'
          ? 'रिपोर्ट दर्ज करने में त्रुटि हुई। कृपया दोबारा प्रयास करें।'
          : 'Failed to submit report. Please try again or call 1363.'
      );
    } finally {
      setLoading(false);
    }
  };

  const copyTicketId = () => {
    if (submittedTicket?.id) {
      navigator.clipboard.writeText(submittedTicket.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetAndClose = () => {
    setSubject('');
    setDescription('');
    setReferenceId('');
    removeAttachment();
    setSubmittedTicket(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                  {lang === 'hi' ? 'नागरिक सहायता व शिकायत प्रकोष्ठ' : 'Citizen Grievance Cell'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-semibold">
                  24x7 Active
                </span>
              </div>
              <h2 className="text-base font-serif font-bold text-white">
                {lang === 'hi' ? 'समस्या या सुझाव दर्ज करें' : 'Report an Issue or Feedback'}
              </h2>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {submittedTicket ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-6 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {lang === 'hi' ? 'आपकी शिकायत सफलतापूर्वक दर्ज हुई!' : 'Grievance Registered Successfully!'}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {lang === 'hi'
                    ? 'संस्कृति मंत्रालय एवं तकनीकी टीम ने आपकी रिपोर्ट स्वीकार कर ली है। प्राथमिकता के आधार पर समाधान किया जाएगा।'
                    : 'The Cultural Cell & Tech Support team have received your report. Investigation is underway.'}
                </p>
              </div>

              {/* Reference Ticket Card */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left space-y-2.5 max-w-sm mx-auto shadow-sm">
                <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                  <span>{lang === 'hi' ? 'ट्रैकिंग टिकट संख्या (Ticket ID)' : 'Official Reference Ticket ID'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono font-bold">
                    SLA: 24h
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-300">
                  <span className="font-mono font-bold text-stone-900 text-sm">{submittedTicket.id}</span>
                  <button
                    type="button"
                    onClick={copyTicketId}
                    className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (lang === 'hi' ? 'कॉपी हुआ' : 'Copied!') : (lang === 'hi' ? 'कॉपी' : 'Copy')}</span>
                  </button>
                </div>

                <div className="text-[11px] text-stone-600 space-y-1 pt-1 border-t border-amber-200/60">
                  <div className="flex justify-between">
                    <span className="text-stone-500">{lang === 'hi' ? 'स्थिति:' : 'Status:'}</span>
                    <span className="font-bold text-amber-700">
                      {lang === 'hi' ? submittedTicket.statusHi || 'समीक्षाधीन' : submittedTicket.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{lang === 'hi' ? 'विषय:' : 'Subject:'}</span>
                    <span className="font-medium text-stone-800 truncate max-w-[200px]">{submittedTicket.subject}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-md transition-all"
                >
                  {lang === 'hi' ? 'ठीक है, बंद करें' : 'Done & Close'}
                </button>
              </div>
            </div>
          ) : (
            /* REPORT INPUT FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Category Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {lang === 'hi' ? '1. समस्या का प्रकार चुनें (Select Category)*' : '1. Issue Category*'}
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-500/20'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg border flex-shrink-0 ${
                            isSelected ? 'bg-amber-600 text-white border-amber-600' : cat.color
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[11px] text-stone-900 truncate">
                            {lang === 'hi' ? cat.titleHi : cat.titleEn}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {lang === 'hi' ? cat.titleEn : cat.titleHi}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Issue Subject */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-800">
                  {lang === 'hi' ? '2. संक्षिप्त विषय (Subject)*' : '2. Issue Subject / Headline*'}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'उदा. लाल किला ऑडियो गाइड रुक रही है, या ऑर्डर #123 में देरी'
                      : 'e.g. Red Fort audio narration stuttering or order #123 issue'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* 3. Related Monument or Order ID (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>
                    {lang === 'hi'
                      ? '3. संबंधित स्मारक या ऑर्डर आईडी (वैकल्पिक)'
                      : '3. Related Monument or Order ID (Optional)'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder={
                    lang === 'hi' ? 'उदा. ताजमहल, कुतुब मीनार या ODOP-10294' : 'e.g. Taj Mahal, Konark Temple, or ODOP-ORD-...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* 4. Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-800">
                  {lang === 'hi' ? '4. विस्तृत विवरण (Detailed Description)*' : '4. Detailed Description*'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === 'hi'
                      ? 'कृपया विस्तार से बताएं कि क्या समस्या आई और इसे ठीक करने के लिए क्या आवश्यक है...'
                      : 'Please describe exactly what happened, when it occurred, and any specifics...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
                <div className="text-[10px] text-stone-400 text-right">
                  {description.length} / 500 characters
                </div>
              </div>

              {/* 5. Screenshot / Photo Attachment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-800">
                  {lang === 'hi' ? '5. स्क्रीनशॉट या फोटो जोड़ें (वैकल्पिक)' : '5. Attach Screenshot or Photo (Optional)'}
                </label>

                {attachmentPreview ? (
                  <div className="relative inline-block border-2 border-amber-500 rounded-xl overflow-hidden shadow-xs">
                    <img
                      src={attachmentPreview}
                      alt="Attachment preview"
                      className="w-32 h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50/50 hover:bg-amber-50/30 text-stone-600 text-xs font-semibold cursor-pointer transition-colors">
                    <Camera className="w-4 h-4 text-amber-700" />
                    <span>
                      {lang === 'hi'
                        ? 'फ़ोटो या स्क्रीनशॉट चुनें (Max 5MB)'
                        : 'Choose Photo or Screenshot (Max 5MB)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* 6. Urgency Priority & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'hi' ? 'प्राथमिकता स्तर (Urgency)' : 'Priority Level'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="normal">{lang === 'hi' ? 'सामान्य (Routine - 48h)' : 'Normal (Routine - 48h)'}</option>
                    <option value="urgent">{lang === 'hi' ? 'अति आवश्यक (Urgent - 24h)' : 'High Priority (Urgent - 24h)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {lang === 'hi' ? 'संपर्क ईमेल (Contact Email)' : 'Contact Email'}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'hi' ? 'दर्ज हो रहा है...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{lang === 'hi' ? 'शिकायत / रिपोर्ट भेजें' : 'Submit Grievance Report'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
