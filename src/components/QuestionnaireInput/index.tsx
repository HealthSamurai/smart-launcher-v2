import { InputHTMLAttributes } from "react";
import useFetch from "../../hooks/useFetch";
import "./QuestionnaireInput.css";

interface QuestionnaireInputProps {
  value?: string;
  fhirServerBaseUrl: string;
  onChange: (list: string) => void;
  limit?: number;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  >;
}

export default function QuestionnaireInput({
  value,
  onChange,
  limit,
  fhirServerBaseUrl,
  inputProps = {},
}: QuestionnaireInputProps) {
  const url = new URL("./Questionnaire", fhirServerBaseUrl);

  if (limit) {
    url.searchParams.set("_count", limit + "");
  }

  const {
    data: bundle,
    error,
    loading,
  } = useFetch<fhir4.Bundle<fhir4.Questionnaire>>(url.href, {
    headers: {
      authorization: `Bearer ${window.ENV.ACCESS_TOKEN}`,
    },
  });
  const records = bundle?.entry?.map((p) => p.resource!) || [];

  if (error) {
    console.error("No questionnaires found. " + error);
  }

  return (
    <div className="dropdown questionnaire-input open">
      <input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
      />
      <QuestionnaireInputMenu
        selection={value}
        records={records}
        onChange={(list) => onChange(list.join(","))}
        loading={loading}
      />
    </div>
  );
}

function QuestionnaireInputMenu({
  selection = "",
  records,
  onChange,
  loading,
}: {
  selection?: string;
  records: fhir4.Questionnaire[];
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
        <li className="text-center text-danger">No Questionnaires Found</li>
      </ul>
    );
  }

  return (
    <ul className="dropdown-menu">
      {records.map((r) => (
        <QuestionnaireInputMenuItem
          key={r.id}
          questionnaire={r}
          selected={ids.includes(r.id!)}
          onChange={createToggleHandler(r.id!)}
        />
      ))}
    </ul>
  );
}

function QuestionnaireInputMenuItem({
  questionnaire,
  selected,
  onChange,
}: {
  questionnaire: fhir4.Questionnaire;
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
        htmlFor={"questionnaire-" + questionnaire.id}
      >
        <div className="input-option-left">
          <input
            id={"questionnaire-" + questionnaire.id}
            type="checkbox"
            value={questionnaire.id}
            checked={selected}
            onChange={onChange}
          />{" "}
          <b>&nbsp;{questionnaire.title}</b>
        </div>
        <div className="text-muted input-option-right">
          <b>ID: </b>
          {questionnaire.id}
        </div>
      </label>
    </li>
  );
}
