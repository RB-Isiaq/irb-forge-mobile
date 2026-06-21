import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  AcceptInvitationPayload,
  DeclineInvitationPayload,
  Invitation,
  InvitationPreview,
  SendInvitationPayload,
} from './types';

export const invitationApi = {
  send: (slug: string, data: SendInvitationPayload) =>
    apiPost<Invitation>(`/organizations/${slug}/invitations`, data),

  listPending: (slug: string) => apiGet<Invitation[]>(`/organizations/${slug}/invitations`),

  cancel: (slug: string, id: string) => apiDelete(`/organizations/${slug}/invitations/${id}`),

  preview: (token: string) => apiGet<InvitationPreview>(`/invitations/preview?token=${token}`),

  mine: () => apiGet<Invitation[]>('/invitations/me'),

  /* Token-based: used when accepting directly from the email link */
  accept: (data: AcceptInvitationPayload) => apiPost<null>('/invitations/accept', data),

  decline: (data: DeclineInvitationPayload) => apiPost<null>('/invitations/decline', data),

  /*
   * ID-based: used when accepting from the in-app inbox.
   * Requires backend: PATCH /invitations/:id/accept and /:id/decline
   */
  acceptById: (id: string) => apiPatch<null>(`/invitations/${id}/accept`),
  declineById: (id: string) => apiPatch<null>(`/invitations/${id}/decline`),

  /*
   * Requires backend: POST /organizations/:slug/invitations/:id/resend
   */
  resend: (slug: string, id: string) =>
    apiPost<null>(`/organizations/${slug}/invitations/${id}/resend`),
};
