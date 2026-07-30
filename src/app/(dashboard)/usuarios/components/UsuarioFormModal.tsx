"use client";

import { useState} from "react";
import { Usuario } from "@/types/usuarios";
import { NuevoUsuarioDTO, RolDTO } from "@/types/dtos";
import { Plus, X } from "@boxicons/react";
import AddRolModal from "./AddRolModal";
import { usuariosApi } from "@/lib/api/usuarios";

const twField =
  "w-full py-[9px] px-3 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none bg-white box-border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
const twLabel = "text-xs font-semibold text-gray-700 mb-1 block";

interface Props {
  usuario: Usuario | null;
  rolesDisponibles: RolDTO[];
  onClose: () => void;
  onSave: (data: NuevoUsuarioDTO | Usuario) => Promise<void>;
}

type FormErrors = Partial<Record<string, string>>;

export default function UsuarioFormModal({
  usuario,
  rolesDisponibles,
  onClose,
  onSave,
}: Props) {
  const isEdit = !!usuario;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAddRol, setShowAddRol] = useState(false);
  const [rolesLocales, setRolesLocales] = useState<RolDTO[]>(rolesDisponibles);

  const [form, setForm] = useState({
    username: usuario?.username || "",
    password: "",
    confirmarPassword: "",
    nombre: usuario?.nombre || "",
    apellido: usuario?.apellido || "",
    email: usuario?.email || "",
    telefono: usuario?.telefono || "",
    is_active: usuario?.is_active ?? true,
    rolesSeleccionados: usuario?.roles.map((r) => r.idRol) || [],
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleRol = (idRol: string) => {
    set(
      "rolesSeleccionados",
      form.rolesSeleccionados.includes(idRol)
        ? form.rolesSeleccionados.filter((id) => id !== idRol)
        : [...form.rolesSeleccionados, idRol],
    );
  };

  const validate = (): boolean => {
    const e: FormErrors = {};

    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.apellido.trim()) e.apellido = "El apellido es requerido";
    if (!form.username.trim()) e.username = "El usuario es requerido";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "El email no es válido";

    if (!isEdit) {
      if (!form.password) e.password = "La contraseña es requerida";
      else if (form.password.length < 8) e.password = "Mínimo 8 caracteres";
    }

    if (form.password && form.password !== form.confirmarPassword)
      e.confirmarPassword = "Las contraseñas no coinciden";

    if (form.rolesSeleccionados.length === 0)
      e.roles = "Asigna al menos un rol";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const roles = rolesDisponibles.filter((r) =>
        form.rolesSeleccionados.includes(r.idRol),
      );

      if (isEdit) {
        const dto: Usuario = {
          ...usuario!,
          idUsuario: usuario!.idUsuario,
          username: form.username,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          telefono: form.telefono,
          is_active: form.is_active,
          roles,
        };
        await onSave(dto);
      } else {
        const dto: NuevoUsuarioDTO = {
          username: form.username,
          password: form.password,
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          telefono: form.telefono,
          is_active: true,
          roles,
        };
        await onSave(dto);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Agrega este handler
  const handleSaveRol = async (nombre: string, descripcion: string) => {
    try {
      const nuevoRol = await usuariosApi.crearRol({ nombre, descripcion });
      setRolesLocales((prev) => [...prev, nuevoRol]);
      toggleRol(nuevoRol.idRol);
    } catch (error) {
      console.error("Error creando rol:", error);
    } finally {
      setShowAddRol(false);
    }
  };

  const handleValidateRol = (nombre: string): string | undefined => {
    if (
      rolesLocales.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase())
    ) {
      return "Ya existe un rol con ese nombre";
    }
    return undefined;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-[min(96vw,520px)] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
      >
        {/* Header */}
        <div className="px-6 py-5 pb-4 border-b border-gray-200 flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${isEdit ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
          >
            {isEdit ? "✎" : "+"}
          </div>
          <h2 className="text-[17px] font-bold text-gray-900 m-0">
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button
            onClick={onClose}
            className="ml-auto bg-transparent border-none cursor-pointer text-gray-400 p-1 flex hover:text-gray-600 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 flex flex-col gap-3">
          {/* Nombre y apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={twLabel}>
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Juan"
                className={`${twField} ${errors.nombre ? "border-red-500" : ""}`}
              />
              {errors.nombre && (
                <p className="text-red-500 text-[11px] mt-1">{errors.nombre}</p>
              )}
            </div>
            <div>
              <label className={twLabel}>
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                value={form.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                placeholder="García"
                className={`${twField} ${errors.apellido ? "border-red-500" : ""}`}
              />
              {errors.apellido && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.apellido}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className={twLabel}>
              Nombre de usuario <span className="text-red-500">*</span>
            </label>
            <input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="juan.garcia"
              className={`${twField} ${errors.username ? "border-red-500" : ""}`}
            />
            {errors.username && (
              <p className="text-red-500 text-[11px] mt-1">{errors.username}</p>
            )}
          </div>

          {/* Email y teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={twLabel}>
                Email <span className="text-slate-500 text-xs">(opcional)</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="juan@radbikes.com"
                className={`${twField} ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className={twLabel}>Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => set("telefono", e.target.value)}
                placeholder="644 123 4567"
                className={twField}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={twLabel}>
                {isEdit ? "Nueva contraseña" : "Contraseña"}{" "}
                {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder={
                  isEdit ? "Dejar vacío para no cambiar" : "Mín. 8 caracteres"
                }
                className={`${twField} ${errors.password ? "border-red-500" : ""}`}
              />
              {errors.password && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label className={twLabel}>Confirmar contraseña</label>
              <input
                type="password"
                value={form.confirmarPassword}
                onChange={(e) => set("confirmarPassword", e.target.value)}
                placeholder="Repetir contraseña"
                className={`${twField} ${errors.confirmarPassword ? "border-red-500" : ""}`}
              />
              {errors.confirmarPassword && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.confirmarPassword}
                </p>
              )}
            </div>
          </div>

          {/* Roles */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={twLabel}>
                Roles <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowAddRol(true)}
                className="text-[12px] text-blue-600 font-semibold hover:text-blue-700 bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <Plus size="xs" pack="filled" /> Nuevo rol
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {rolesLocales.map((rol) => {
                const selected = form.rolesSeleccionados.includes(rol.idRol);
                return (
                  <button
                    key={rol.idRol}
                    type="button"
                    onClick={() => toggleRol(rol.idRol)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {rol.nombre}
                  </button>
                );
              })}
              {rolesLocales.length === 0 && (
                <span className="text-gray-400 text-[12px]">
                  No hay roles — crea uno con el botón
                </span>
              )}
            </div>
            {errors.roles && (
              <p className="text-red-500 text-[11px] mt-1">{errors.roles}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2.5 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg border-none bg-blue-600 text-white cursor-pointer text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Guardando..."
              : isEdit
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </div>
      {showAddRol && (
        <AddRolModal
          onClose={() => setShowAddRol(false)}
          onSave={handleSaveRol}
          validate={handleValidateRol}
        />
      )}
    </div>
  );
}
