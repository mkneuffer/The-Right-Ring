// GA4 Analytics — TheRightRing
// Replace G-XXXXXXXXXX with your real Measurement ID before going live.
const GA4_ID = 'G-2FFWMR9HRW';

function gtag(...args: Parameters<Window['gtag']>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

// ── Funnel navigation ──────────────────────────────────────────────────────

export function trackStepView(stepIndex: number, stepTitle: string): void {
  gtag('event', 'funnel_step_view', {
    step_number: stepIndex,
    step_name: stepTitle,
  });
}

export function trackStepAdvance(fromStep: number, fromStepTitle: string): void {
  gtag('event', 'funnel_step_advance', {
    from_step: fromStep,
    from_step_name: fromStepTitle,
  });
}

export function trackStepBack(fromStep: number, fromStepTitle: string): void {
  gtag('event', 'funnel_step_back', {
    from_step: fromStep,
    from_step_name: fromStepTitle,
  });
}

// ── Option & modal interactions ────────────────────────────────────────────

export function trackOptionSelect(
  questionId: string,
  optionId: string,
  optionName: string
): void {
  gtag('event', 'select_content', {
    content_type: questionId,
    content_id: optionId,
    item_name: optionName,
  });
}

export function trackModalOpen(modalName: string, context?: string): void {
  gtag('event', 'modal_open', {
    modal_name: modalName,
    ...(context ? { context } : {}),
  });
}

// ── Diamond selection ──────────────────────────────────────────────────────

export function trackDiamondSelect(
  diamondId: string,
  shape: string,
  carats: string,
  diamondType: string,
  priceUsd?: number
): void {
  gtag('event', 'select_item', {
    item_list_id: 'diamond_selector',
    items: [
      {
        item_id: diamondId,
        item_name: `${carats}ct ${shape} ${diamondType}`,
        item_category: shape,
        item_category2: diamondType,
        ...(priceUsd !== undefined ? { price: priceUsd } : {}),
      },
    ],
  });
}

// ── Summary / checkout ─────────────────────────────────────────────────────

export function trackSummaryView(): void {
  gtag('event', 'begin_checkout', {
    currency: 'USD',
  });
}

export function trackFormStart(): void {
  gtag('event', 'form_start', {
    form_name: 'ring_inquiry',
  });
}

export function trackDepositInitiated(): void {
  gtag('event', 'add_payment_info', {
    currency: 'USD',
    value: 500,
    payment_type: 'stripe_deposit',
  });
}

export function trackInquirySubmitted(): void {
  gtag('event', 'generate_lead', {
    currency: 'USD',
  });
}

export function trackPaymentSuccess(): void {
  gtag('event', 'purchase', {
    transaction_id: `trr_${Date.now()}`,
    currency: 'USD',
    value: 500,
    items: [
      {
        item_id: 'deposit_500',
        item_name: 'Custom Ring Design Deposit',
        price: 500,
        quantity: 1,
      },
    ],
  });
}

export { GA4_ID };
