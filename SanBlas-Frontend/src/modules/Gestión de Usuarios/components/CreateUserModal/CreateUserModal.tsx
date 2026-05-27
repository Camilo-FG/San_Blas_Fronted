import React, { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import './CreateUserModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserData) => void;
}

interface CreateUserData {
  nombre: string;
  correo: string;
  telefono: string;
  contraseña: string;
}

const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    nombre: '',
    correo: '',
    telefono: '',
    contraseña: '',
  });
  const captchaRef = useRef<ReCAPTCHA>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Datos del usuario:', formData);
    console.log('Token reCAPTCHA:', captchaToken);

    onSave(formData);
    
    //limpia el formulario
    setFormData({
      nombre: '',
      correo: '',
      telefono: '',
      contraseña: '',
    });
    setCaptchaToken(null);
    captchaRef.current?.reset();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>CREAR NUEVO USUARIO</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Campo Nombre */}
            <div className="modal-form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                placeholder="Ej: Juan Pérez González"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
              />
            </div>

            {/* Campo Correo */}
            <div className="modal-form-group">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                id="correo"
                type="email"
                placeholder="Ej: ejemplo@correo.com"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
              />
            </div>

            {/* Campo Teléfono y Contraseña en fila */}
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  placeholder="Ej: 8888-8888"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="contraseña">Contraseña</label>
                <input
                  id="contraseña"
                  type="password"
                  placeholder="Ingresá una contraseña segura"
                  value={formData.contraseña}
                  onChange={(e) => handleInputChange('contraseña', e.target.value)}
                />
              </div>
            </div>

            {/* reCAPTCHA */}
            <div className="modal-form-group modal-captcha-group">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(token: string | null) => {
                  setCaptchaToken(token);
                }}
                onExpired={() => setCaptchaToken(null)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={onClose}
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn--primary"
            >
              CREAR USUARIO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
