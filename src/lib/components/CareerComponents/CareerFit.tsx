import { handleCareerFitColor } from "@/lib/Utils";

export default function CareerFit({ fit, assessment }: any) {
    const { background, color } = handleCareerFitColor(fit);

    return (
      <a
        data-tooltip-id="career-fit-tooltip"
        data-tooltip-html={assessment || "No assessment available"}
      >
        <span
            style={{
                width: "fit-content",
                background,
                color,
                borderRadius: 16,
                padding: "2px 10px",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
            }}
        >
            {fit?.includes("Strong Fit") && <i className="la la-star" style={{ color }}></i>} {fit}
        </span>
      </a>
    )
}