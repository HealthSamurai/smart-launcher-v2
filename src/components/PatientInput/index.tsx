import { InputHTMLAttributes } from "react";
import useFetch from "../../hooks/useFetch";
import { humanName } from "../../lib";
import "./PatientInput.css";

interface PatientInputProps {
  value?: string;
  fhirServerBaseUrl: string;
  onChange: (list: string) => void;
  limit?: number;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  >;
}

export default function PatientInput({
  value,
  onChange,
  limit,
  fhirServerBaseUrl,
  inputProps = {},
}: PatientInputProps) {
  const url = new URL("./Patient", fhirServerBaseUrl);

  if (limit) {
    url.searchParams.set("_count", limit + "");
  }

  const {
    data: bundle,
    error,
    loading,
  } = useFetch<fhir4.Bundle<fhir4.Patient>>(url.href, {
    headers: {
      authorization: `Bearer ${window.ENV.ACCESS_TOKEN}`,
    },
  });
  const records = bundle?.entry?.map((p) => p.resource!) || [];

  if (error) {
    console.error("No patients found. " + error);
  }

  return (
    <div className="dropdown patient-input open">
      <input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
      />
      <PatientInputMenu
        selection={value}
        records={records}
        onChange={(list) => onChange(list.join(","))}
        loading={loading}
      />
    </div>
  );
}

function PatientInputMenu({
  selection = "",
  records,
  onChange,
  loading,
}: {
  selection?: string;
  records: fhir4.Patient[];
  onChange: (list: string[]) => void;
  loading?: boolean;
}) {
  const ids = selection
    .trim()
    .split(/\s*,\s*/)
    .filter(Boolean);

  const createToggleHandler = (id: string) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        if (!ids.includes(id)) {
          ids.push(id);
          onChange(ids);
        }
      } else {
        const index = ids.indexOf(id);
        if (index > -1) {
          ids.splice(index, 1);
          onChange(ids);
        }
      }
    };
  };

  if (loading) {
    return (
      <ul className="dropdown-menu">
        <li className="text-center text-info">Loading...</li>
      </ul>
    );
  }

  if (!records.length) {
    return (
      <ul className="dropdown-menu">
        <li className="text-center text-danger">No Patients Found</li>
      </ul>
    );
  }

  return (
    <ul className="dropdown-menu">
      {records.map((r) => (
        <PatientInputMenuItem
          key={r.id}
          patient={r}
          selected={ids.includes(r.id!)}
          onChange={createToggleHandler(r.id!)}
        />
      ))}
    </ul>
  );
}

function PatientInputMenuItem({
  patient,
  selected,
  onChange,
}: {
  patient: fhir4.Patient;
  selected: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <li className="input-option">
      <label
        onFocusCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.preventDefault()}
        htmlFor={"patient-" + patient.id}
      >
        <div className="input-option-left">
          <input
            id={"patient-" + patient.id}
            type="checkbox"
            value={patient.id}
            checked={selected}
            onChange={onChange}
          />{" "}
          <b>&nbsp;{humanName(patient)}</b>
        </div>
        <div className="text-muted input-option-right">
          <b>ID: </b>
          {patient.id}
        </div>
      </label>
    </li>
  );
}
