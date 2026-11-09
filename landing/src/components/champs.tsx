"use client";
// Petits composants de formulaire accessibles (label, aide, message d'erreur reliés).
import { useId, type ReactNode } from "react";

type BaseProps = {
  name: string;
  label: ReactNode;
  aide?: ReactNode;
  erreur?: string;
  requis?: boolean;
};

function Etoile({ requis }: { requis?: boolean }) {
  return requis ? (
    <>
      <span className="text-magenta-fonce" aria-hidden="true">
        {" "}*
      </span>
      <span className="sr-only"> (obligatoire)</span>
    </>
  ) : (
    <span className="font-normal text-[#5d3a58]"> (facultatif)</span>
  );
}

export function Erreur({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="erreur">
      {message}
    </p>
  );
}

type InputProps = BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">;

export function Champ({ name, label, aide, erreur, requis, ...rest }: InputProps) {
  const id = useId();
  const aideId = `${id}-aide`;
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        <Etoile requis={requis} />
      </label>
      {aide && (
        <p id={aideId} className="aide mb-1.5">
          {aide}
        </p>
      )}
      <input
        id={id}
        name={name}
        className="champ"
        aria-required={requis || undefined}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={[aide ? aideId : "", erreur ? errId : ""].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      <Erreur id={errId} message={erreur} />
    </div>
  );
}

type TextareaProps = BaseProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">;

export function Zone({ name, label, aide, erreur, requis, ...rest }: TextareaProps) {
  const id = useId();
  const aideId = `${id}-aide`;
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        <Etoile requis={requis} />
      </label>
      {aide && (
        <p id={aideId} className="aide mb-1.5">
          {aide}
        </p>
      )}
      <textarea
        id={id}
        name={name}
        rows={4}
        className="champ"
        aria-required={requis || undefined}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={[aide ? aideId : "", erreur ? errId : ""].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      <Erreur id={errId} message={erreur} />
    </div>
  );
}

type SelectProps = BaseProps & { options: readonly string[]; placeholder?: string } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">;

export function Liste({ name, label, aide, erreur, requis, options, placeholder = "Choisir…", ...rest }: SelectProps) {
  const id = useId();
  const errId = `${id}-err`;
  const aideId = `${id}-aide`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        <Etoile requis={requis} />
      </label>
      {aide && (
        <p id={aideId} className="aide mb-1.5">
          {aide}
        </p>
      )}
      <select
        id={id}
        name={name}
        className="champ"
        defaultValue=""
        aria-required={requis || undefined}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={[aide ? aideId : "", erreur ? errId : ""].filter(Boolean).join(" ") || undefined}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Erreur id={errId} message={erreur} />
    </div>
  );
}

type ChoixProps = BaseProps & {
  options: readonly { value: string; label: ReactNode }[];
  type?: "radio" | "checkbox";
  onValeur?: (v: string, checked: boolean) => void;
};

/** Groupe de boutons radio (ou cases) présentés en « puces » faciles à toucher. */
export function Choix({ name, label, aide, erreur, requis, options, type = "radio", onValeur }: ChoixProps) {
  const id = useId();
  const errId = `${id}-err`;
  const aideId = `${id}-aide`;
  return (
    <fieldset
      aria-describedby={[aide ? aideId : "", erreur ? errId : ""].filter(Boolean).join(" ") || undefined}
    >
      <legend className="label">
        {label}
        <Etoile requis={requis} />
      </legend>
      {aide && (
        <p id={aideId} className="aide mb-2">
          {aide}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="puce">
            <input type={type} name={name} value={o.value} onChange={(e) => onValeur?.(o.value, e.target.checked)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <Erreur id={errId} message={erreur} />
    </fieldset>
  );
}
