const AUDIENCE_ALIASES = {
  male: "Men",
  man: "Men",
  men: "Men",
  female: "Women",
  woman: "Women",
  women: "Women",
  kid: "Kids",
  kids: "Kids",
  child: "Kids",
  children: "Kids",
  unisex: "Unisex",
};

const getCanonicalAudience = (value, fallback = "Unisex") => {
  const audience = String(value ?? "").trim();
  if (!audience) return fallback;

  const normalized = AUDIENCE_ALIASES[audience.toLowerCase()];
  if (normalized) return normalized;

  if (["Men", "Women", "Kids", "Unisex"].includes(audience)) {
    return audience;
  }

  return fallback;
};

const getAudienceQueryValues = (value) => {
  const audience = String(value ?? "").trim();
  if (!audience) return [];

  const normalized = getCanonicalAudience(audience, "");
  const values = new Set([audience]);

  if (normalized) {
    values.add(normalized);
    if (normalized === "Men") {
      values.add("Male");
      values.add("Man");
    } else if (normalized === "Women") {
      values.add("Female");
      values.add("Woman");
    } else if (normalized === "Kids") {
      values.add("Kid");
      values.add("Child");
      values.add("Children");
    }
  }

  return [...values];
};

module.exports = {
  getCanonicalAudience,
  getAudienceQueryValues,
};
