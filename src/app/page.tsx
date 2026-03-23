"use client";

import { useState } from "react";
import {
  EyeClosed,
  EyeAlt,
  ArrowInRightSquareHalf,
  Lock,
} from "@boxicons/react";
import Image from "next/image";
import { authApi } from "@/lib/api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit called");
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsLoading(true);

    try {
      console.log("Calling login API...");
      const sesion = await authApi.login({ username: username, password: password });
      console.log("Login successful, sesion:", sesion);
      localStorage.setItem("token", sesion.token);
      localStorage.setItem("usuario", JSON.stringify(sesion.usuario));
      window.location.href = "/catalogo";
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 flex-col"
      style={{ backgroundColor: "#DBEAFE" }}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          {/* RAD Bikes Logo */}
          <div className="mb-8 mt-4 text-center flex justify-center">
            <Image
              width={64}
              height={64}
              src={'/Ohare.jpeg'}
              alt= "Logo"
              className="object-cover"
            />
            <h2 className="text-2xl text-black ml-4 font-bold">RAD Bikes</h2>
          </div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Iniciar Sesión
          </h1>
          <span className="text-gray-500 text-md">
            Acceso al sistema interno de gestión
          </span>
        </div>

        {/* Formulario */}
        <form onSubmit={(e) => { e.preventDefault(); console.log("Form submitted"); handleSubmit(e); }} className="space-y-5">
          {/* Campo Usuario */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border text-slate-950 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-300"
              placeholder="Ingrese su usuario"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-slate-950 focus:ring-blue-500 focus:border-transparent transition-all pr-10 placeholder-slate-300"
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <EyeAlt size="sm" /> : <EyeClosed size="sm" />}
              </button>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-800 hover:bg-blue-700 cursor-pointer text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Cargando...</span>
              </>
            ) : (
              <>
                <span>Ingresar</span>
                <ArrowInRightSquareHalf />
              </>
            )}
          </button>

          {/* Enlace Olvidó contraseña */}
          <div className="text-center">
            <a
              href="#"
              className="text-sm text-primary hover:text-blue-800 hover:underline transition-colors"
            >
              ¿Olvidó su contraseña?
            </a>
          </div>
        </form>

        {/* Portal Seguro */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Lock size="sm" />
            <span className="font-medium tracking-wide">PORTAL SEGURO</span>
          </div>
        </div>
      </div>
      <span className="max-w-md text-slate-500 text-center text-sm mt-4">
        Este sistema es para uso exclusivo del personal autorizado de RAD Bikes.
        El acceso no autorizado está estrictamente prohibido.
      </span>
    </div>
  );
}
