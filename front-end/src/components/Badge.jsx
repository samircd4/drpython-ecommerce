const Badge = ({ text, color = "purple" }) => {
    const colors = {
        purple: "bg-purple-200 text-purple-700",
        green: "bg-green-200 text-green-700",
        red: "bg-red-200 text-red-700",
        blue: "bg-blue-200 text-blue-700",
    };

    return (
        <span
            className={`text-xs font-semibold ${colors[color]} px-2 py-1 rounded-full ml-2`}
        >
            {text}
        </span>
    );
};

export default Badge;
