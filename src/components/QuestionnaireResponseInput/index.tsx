import { InputHTMLAttributes } from "react";
import useFetch from "../../hooks/useFetch";
import "./QuestionnaireResponseInput.css";

interface QuestionnaireResponseInputProps {
  value?: string;
  fhirServerBaseUrl: string;
  onChange: (list: string) => void;
  limit?: number;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "className"
  >;
}

export default function QuestionnaireResponseInput({
  value,
  onChange,
  limit,
  fhirServerBaseUrl,
  inputProps = {},
}: QuestionnaireResponseInputProps) {
  const url = new URL("./QuestionnaireResponse", fhirServerBaseUrl);

  if (limit) {
    url.searchParams.set("_count", limit + "");
  }

  const {
    data: bundle,
    error,
    loading,
  } = useFetch<fhir4.Bundle<fhir4.QuestionnaireResponse>>(url.href, {
    headers: {
      authorization: `Bearer ${window.ENV.ACCESS_TOKEN}`,
    },
  });
  const records = bundle?.entry?.map((p) => p.resource!) || [];

  if (error) {
    console.error("No questionnaireResponses found. " + error);
  }

  return (
    <div className="dropdown questionnaire-response-input open">
      <input
        {...inputProps}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-control"
      />
      <QuestionnaireResponseInputMenu
        selection={value}
        records={records}
        onChange={(list) => onChange(list.join(","))}
        loading={loading}
      />
    </div>
  );
}

function QuestionnaireResponseInputMenu({
  selection = "",
  records,
  onChange,
  loading,
}: {
  selection?: string;
  records: fhir4.QuestionnaireResponse[];
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
        <li className="text-center text-danger">No QuestionnaireResponses Found</li>
      </ul>
    );
  }

  return (
    <ul className="dropdown-menu">
      {records.map((r) => (
        <QuestionnaireResponseInputMenuItem
          key={r.id}
          questionnaireResponse={r}
          selected={ids.includes(r.id!)}
          onChange={createToggleHandler(r.id!)}
        />
      ))}
    </ul>
  );
}

function QuestionnaireResponseInputMenuItem({
  questionnaireResponse,
  selected,
  onChange,
}: {
  questionnaireResponse: fhir4.QuestionnaireResponse;
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
        htmlFor={"questionnaire-response-" + questionnaireResponse.id}
      >
        <div className="input-option-left">
          <input
            id={"questionnaire-response-" + questionnaireResponse.id}
            type="checkbox"
            value={questionnaireResponse.id}
            checked={selected}
            onChange={onChange}
          />{" "}
          <b>&nbsp;{questionnaireResponse.id}</b>
        </div>
        <div className="text-muted input-option-right">
          <b>ID: </b>
          {questionnaireResponse.id}
        </div>
      </label>
    </li>
  );
}
