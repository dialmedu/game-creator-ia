import { useState } from 'react';
import { Mail, Copy, Check, Chrome, Globe } from 'lucide-react';
import { useI18n } from '@/i18n';

const DESTINATION_EMAIL = 'diegomesa.1414@gmail.com';

interface FormData {
  name: string;
  email: string;
  projectType: string;
  projectTitle: string;
  projectDescription: string;
  targetAudience: string;
  budget: string;
  timeline: string;
}

const initialForm: FormData = {
  name: '',
  email: '',
  projectType: 'story',
  projectTitle: '',
  projectDescription: '',
  targetAudience: '',
  budget: '',
  timeline: '',
};

export function ContactForm() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const buildEmailBody = (): string => {
    const projectTypeLabel: Record<string, string> = {
      story: t.createGame.projectTypeStory,
      book: t.createGame.projectTypeBook,
      campaign: t.createGame.projectTypeCampaign,
      other: t.createGame.projectTypeOther,
    };

    return [
      `=== SOLICITUD DE CREACION DE VIDEOJUEGO ===`,
      ``,
      `Nombre: ${form.name}`,
      `Correo: ${form.email}`,
      `Tipo de proyecto: ${projectTypeLabel[form.projectType] || form.projectType}`,
      `Titulo del proyecto: ${form.projectTitle}`,
      ``,
      `--- DESCRIPCION DE LA HISTORIA ---`,
      `${form.projectDescription}`,
      ``,
      `--- PUBLICO OBJETIVO ---`,
      `${form.targetAudience || 'No especificado'}`,
      ``,
      `--- PRESUPUESTO ---`,
      `${form.budget || 'No especificado'}`,
      ``,
      `--- PLAZO ---`,
      `${form.timeline || 'No especificado'}`,
      ``,
      `=== Enviado desde Imperium Games ===`,
    ].join('\n');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.projectTitle.trim()) newErrors.projectTitle = true;
    if (!form.projectDescription.trim()) newErrors.projectDescription = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const subject = `Solicitud de videojuego: ${form.projectTitle || 'Nuevo proyecto'}`;

  const handleGmail = () => {
    if (!validate()) return;
    const body = encodeURIComponent(buildEmailBody());
    const subjectEnc = encodeURIComponent(subject);
    const to = encodeURIComponent(DESTINATION_EMAIL);
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subjectEnc}&body=${body}`,
      '_blank',
    );
  };

  const handleOutlook = () => {
    if (!validate()) return;
    const body = encodeURIComponent(buildEmailBody());
    const subjectEnc = encodeURIComponent(subject);
    const to = encodeURIComponent(DESTINATION_EMAIL);
    window.open(
      `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${subjectEnc}&body=${body}`,
      '_blank',
    );
  };

  const handleCopy = async () => {
    if (!validate()) return;
    try {
      await navigator.clipboard.writeText(
        `Para: ${DESTINATION_EMAIL}\nAsunto: ${subject}\n\n${buildEmailBody()}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-slate-800 border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-emerald-600/40 ${
      hasError ? 'border-red-500/60' : 'border-slate-700 focus:border-emerald-600'
    }`;

  return (
    <div id="create" className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-white mb-2">{t.createGame.title}</h3>
      <p className="text-slate-400 text-sm mb-6">{t.createGame.subtitle}</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.createGame.yourName} *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass(errors.name)}
              placeholder="Juan Perez"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.createGame.yourEmail} *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass(errors.email)}
              placeholder="juan@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t.createGame.projectType}
          </label>
          <select
            value={form.projectType}
            onChange={(e) => update('projectType', e.target.value)}
            className={inputClass(false)}
          >
            <option value="story">{t.createGame.projectTypeStory}</option>
            <option value="book">{t.createGame.projectTypeBook}</option>
            <option value="campaign">{t.createGame.projectTypeCampaign}</option>
            <option value="other">{t.createGame.projectTypeOther}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t.createGame.projectTitle} *
          </label>
          <input
            type="text"
            value={form.projectTitle}
            onChange={(e) => update('projectTitle', e.target.value)}
            className={inputClass(errors.projectTitle)}
            placeholder="La historia de mi empresa..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {t.createGame.projectDescription} *
          </label>
          <textarea
            value={form.projectDescription}
            onChange={(e) => update('projectDescription', e.target.value)}
            className={`${inputClass(errors.projectDescription)} min-h-[120px] resize-y`}
            placeholder="..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.createGame.targetAudience}
            </label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => update('targetAudience', e.target.value)}
              className={inputClass(false)}
              placeholder="..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.createGame.budget}
            </label>
            <input
              type="text"
              value={form.budget}
              onChange={(e) => update('budget', e.target.value)}
              className={inputClass(false)}
              placeholder="$5,000"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.createGame.timeline}
            </label>
            <input
              type="text"
              value={form.timeline}
              onChange={(e) => update('timeline', e.target.value)}
              className={inputClass(false)}
              placeholder="3 meses"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <p className="text-xs text-slate-400 mb-3 font-semibold">{t.createGame.sendVia}:</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGmail}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-red-900/30"
          >
            <Chrome className="w-4 h-4" />
            {t.createGame.gmail}
          </button>
          <button
            onClick={handleOutlook}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-3 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer shadow-lg shadow-blue-900/30"
          >
            <Globe className="w-4 h-4" />
            {t.createGame.outlook}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? t.createGame.copied : t.createGame.copyText}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-3 flex items-center gap-1">
          <Mail className="w-3 h-3" />
          {DESTINATION_EMAIL}
        </p>
      </div>
    </div>
  );
}
