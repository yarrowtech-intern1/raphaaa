const getOfferPercent = (offer) =>
  Number(offer?.benefit?.percent || offer?.offerPercentage || 0);

const isOfferInWindow = (offer, now) => {
  if (!offer) return false;
  const start = new Date(offer.startDate);
  const end = new Date(offer.endDate);
  return offer.isActive !== false && now >= start && now <= end;
};

const isOfferUpcoming = (offer, now) => {
  if (!offer) return false;
  return offer.isActive !== false && now < new Date(offer.startDate);
};

const matchesProduct = (offer, productId) =>
  Array.isArray(offer?.productIds) &&
  offer.productIds.some((id) => String(id) === String(productId));

const sortByPriority = (a, b) => {
  const priorityA = Number(a?.priority ?? 100);
  const priorityB = Number(b?.priority ?? 100);
  if (priorityA !== priorityB) return priorityA - priorityB;

  const percentA = Number(getOfferPercent(a));
  const percentB = Number(getOfferPercent(b));
  if (percentA !== percentB) return percentB - percentA;

  return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
};

const formatTimedOffer = (product, offers = [], now = new Date()) => {
  const basePrice = Number(product?.price || 0);
  const linkedOffers = offers.filter((offer) => matchesProduct(offer, product?._id));

  if (linkedOffers.length === 0) {
    return {
      displayPrice: Number(product?.discountPrice || product?.price || 0),
      discountPrice: product?.discountPrice ?? null,
      offerPercentage: Number(product?.offerPercentage || 0),
      timedOffer: null,
    };
  }

  const activeOffers = linkedOffers.filter((offer) => isOfferInWindow(offer, now)).sort(sortByPriority);
  const upcomingOffers = linkedOffers.filter((offer) => isOfferUpcoming(offer, now)).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const selectedOffer = activeOffers[0] || upcomingOffers[0] || null;

  if (!selectedOffer) {
    return {
      displayPrice: basePrice,
      discountPrice: null,
      offerPercentage: 0,
      timedOffer: {
        status: "expired",
        title: linkedOffers[0]?.title || "",
        offerId: linkedOffers[0]?._id || null,
        startsAt: linkedOffers[0]?.startDate || null,
        endsAt: linkedOffers[0]?.endDate || null,
        offerPercentage: getOfferPercent(linkedOffers[0]),
        originalPrice: basePrice,
      },
    };
  }

  const percent = getOfferPercent(selectedOffer);
  const discountedPrice = Number((basePrice - (basePrice * percent) / 100).toFixed(2));

  if (activeOffers.length > 0) {
    return {
      displayPrice: discountedPrice,
      discountPrice: discountedPrice,
      offerPercentage: percent,
      timedOffer: {
        status: "live",
        title: selectedOffer.title || "",
        offerId: selectedOffer._id || null,
        startsAt: selectedOffer.startDate || null,
        endsAt: selectedOffer.endDate || null,
        offerPercentage: percent,
        originalPrice: basePrice,
        discountPrice: discountedPrice,
      },
    };
  }

  return {
    displayPrice: basePrice,
    discountPrice: null,
    offerPercentage: 0,
    timedOffer: {
      status: "upcoming",
      title: selectedOffer.title || "",
      offerId: selectedOffer._id || null,
      startsAt: selectedOffer.startDate || null,
      endsAt: selectedOffer.endDate || null,
      offerPercentage: percent,
      originalPrice: basePrice,
      discountPrice: discountedPrice,
    },
  };
};

const decorateProductWithTimedOffer = (product, offers = [], now = new Date()) => {
  const doc = typeof product?.toObject === "function" ? product.toObject() : { ...product };
  const pricing = formatTimedOffer(doc, offers, now);
  return {
    ...doc,
    ...pricing,
  };
};

module.exports = {
  decorateProductWithTimedOffer,
  formatTimedOffer,
  getOfferPercent,
  isOfferInWindow,
  isOfferUpcoming,
  matchesProduct,
};
