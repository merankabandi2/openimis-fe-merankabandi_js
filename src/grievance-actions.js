/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
/**
 * Grievance ticket actions extracted from openimis-fe-grievance_social_protection_js (mera/main).
 * These actions dispatch to the grievanceSocialProtection reducer in the upstream grievance module.
 * Action types must match exactly so the upstream reducer handles them correctly.
 */
import {
  graphql, formatMutation, formatPageQueryWithCount, formatGQLString, decodeId,
} from '@openimis/fe-core';

function isBase64Encoded(str) {
  const base64RegExp = /^[A-Za-z0-9+/=]+$/;
  return base64RegExp.test(str);
}

function arrayToSpaceSeparatedString(value) {
  if (Array.isArray(value)) {
    return value.join(' ');
  }
  return value;
}

// Build jsonExt from custom form fields that aren't on the upstream Ticket model
function buildJsonExtFromTicket(ticket) {
  const existing = ticket.jsonExt
    ? (typeof ticket.jsonExt === 'string' ? JSON.parse(ticket.jsonExt) : ticket.jsonExt)
    : {};
  const ext = { ...existing };

  // Reporter fields
  if (ticket.reporterName || ticket.reporterPhone || ticket.gender || ticket.cniNumber) {
    ext.reporter = {
      ...(ext.reporter || {}),
      name: ticket.reporterName || ext.reporter?.name || '',
      phone: ticket.reporterPhone || ext.reporter?.phone || '',
      gender: ticket.gender || ext.reporter?.gender || '',
      cni_number: ticket.cniNumber || ext.reporter?.cni_number || '',
      is_anonymous: ticket.isAnonymous ?? ext.reporter?.is_anonymous ?? false,
      is_batwa: ticket.isBatwa ?? ext.reporter?.is_batwa ?? false,
      is_beneficiary: ticket.isBeneficiary ?? ext.reporter?.is_beneficiary ?? false,
      beneficiary_type: ticket.beneficiaryType || ext.reporter?.beneficiary_type || '',
    };
  }

  // Location
  if (ticket.colline) {
    ext.location = { ...(ext.location || {}), colline: ticket.colline };
  }

  // Subcategory details
  const subcategories = {};
  if (ticket.vbgType) subcategories.vbg_type = ticket.vbgType;
  if (ticket.vbgDetail) subcategories.vbg_detail = ticket.vbgDetail;
  if (ticket.exclusionType) subcategories.exclusion_type = ticket.exclusionType;
  if (ticket.exclusionDetail) subcategories.exclusion_detail = ticket.exclusionDetail;
  if (ticket.paymentType) subcategories.payment_type = ticket.paymentType;
  if (ticket.paymentDetail) subcategories.payment_detail = ticket.paymentDetail;
  if (ticket.phoneType) subcategories.phone_type = ticket.phoneType;
  if (ticket.phoneDetail) subcategories.phone_detail = ticket.phoneDetail;
  if (ticket.accountType) subcategories.account_type = ticket.accountType;
  if (ticket.accountDetail) subcategories.account_detail = ticket.accountDetail;
  if (Object.keys(subcategories).length) ext.subcategories = { ...(ext.subcategories || {}), ...subcategories };

  // Collection / receiver
  if (ticket.receiverName || ticket.receiverPhone || ticket.receiverFunction) {
    ext.submission = {
      ...(ext.submission || {}),
      collector_name: ticket.receiverName || ext.submission?.collector_name || '',
      collector_phone: ticket.receiverPhone || ext.submission?.collector_phone || '',
      collector_function: ticket.receiverFunction || ext.submission?.collector_function || '',
    };
  }

  // Resolution
  if (ticket.isResolved !== undefined || ticket.resolverName || ticket.resolutionDetails) {
    ext.resolution_initial = {
      ...(ext.resolution_initial || {}),
      is_resolved: ticket.isResolved ? 'oui' : 'non',
      resolver_name: ticket.resolverName || '',
      resolver_function: ticket.resolverFunction || '',
      details: ticket.resolutionDetails || '',
    };
  }

  // VBG specific
  if (ticket.violHospital !== undefined) ext.viol_hospital = ticket.violHospital;
  if (ticket.violComplaint !== undefined) ext.viol_complaint = ticket.violComplaint;
  if (ticket.violSupport !== undefined) ext.viol_support = ticket.violSupport;

  return ext;
}

// Format for upstream createTicket mutation — only real Ticket model fields + jsonExt
export function formatTicketGQL(ticket) {
  const jsonExt = buildJsonExtFromTicket(ticket);
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${ticket.code ? `code: "${formatGQLString(ticket.code)}"` : ''}
    ${!!ticket.category ? `category: "${arrayToSpaceSeparatedString(ticket.category)}"` : ''}
    ${!!ticket.title ? `title: "${formatGQLString(ticket.title)}"` : ''}
    ${!!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ''}
    ${!!ticket.description ? `description: "${formatGQLString(ticket.description)}"` : ''}
    ${ticket.reporter ? (isBase64Encoded(ticket.reporter.id) ? `reporterId: "${decodeId(ticket.reporter.id)}"` : `reporterId: "${ticket.reporter.id}"`) : ''}
    ${!!ticket.reporterType ? `reporterType: "${ticket.reporterType}"` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.status ? `status: "${formatGQLString(ticket.status)}"` : ''}
    ${ticket.priority ? `priority: "${formatGQLString(ticket.priority)}"` : ''}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${!!ticket.channel ? `channel: "${arrayToSpaceSeparatedString(ticket.channel)}"` : ''}
    ${!!ticket.flags ? `flags: "${arrayToSpaceSeparatedString(ticket.flags)}"` : ''}
    jsonExt: ${JSON.stringify(JSON.stringify(jsonExt))}
  `;
}

// Format for upstream updateTicket mutation
export function formatUpdateTicketGQL(ticket) {
  const jsonExt = buildJsonExtFromTicket(ticket);
  return `
    ${ticket.id !== undefined && ticket.id !== null ? `id: "${ticket.id}"` : ''}
    ${!!ticket.category ? `category: "${arrayToSpaceSeparatedString(ticket.category)}"` : ''}
    ${!!ticket.title ? `title: "${formatGQLString(ticket.title)}"` : ''}
    ${!!ticket.description ? `description: "${formatGQLString(ticket.description)}"` : ''}
    ${!!ticket.attendingStaff ? `attendingStaffId: "${decodeId(ticket.attendingStaff.id)}"` : ''}
    ${ticket.reporter ? (isBase64Encoded(ticket.reporter.id) ? `reporterId: "${decodeId(ticket.reporter.id)}"` : `reporterId: "${ticket.reporter.id}"`) : ''}
    ${ticket.reporter ? `reporterType: "${ticket.reporterTypeName || ticket.reporterType}"` : ''}
    ${ticket.resolution ? `resolution: "${formatGQLString(ticket.resolution)}"` : ''}
    ${ticket.status ? `status: ${formatGQLString(ticket.status)}` : ''}
    ${ticket.priority ? `priority: "${formatGQLString(ticket.priority)}"` : ''}
    ${ticket.dueDate ? `dueDate: "${formatGQLString(ticket.dueDate)}"` : ''}
    ${ticket.dateOfIncident ? `dateOfIncident: "${formatGQLString(ticket.dateOfIncident)}"` : ''}
    ${!!ticket.channel ? `channel: "${arrayToSpaceSeparatedString(ticket.channel)}"` : ''}
    ${!!ticket.flags ? `flags: "${arrayToSpaceSeparatedString(ticket.flags)}"` : ''}
    jsonExt: ${JSON.stringify(JSON.stringify(jsonExt))}
  `;
}

export function formatTicketCommentGQL(ticketComment, ticket, commenterType) {
  return `
    ${ticketComment.uuid !== undefined && ticketComment.uuid !== null ? `uuid: "${ticketComment.uuid}"` : ''}
    ${ticket.id ? `ticketId: "${ticket.id}"` : ''}
    ${ticketComment.commenter ? `commenterId: "${decodeId(ticketComment.commenter.id)}"` : ''}
    ${commenterType ? `commenterType: "${commenterType}"` : ''}
    ${ticketComment.comment ? `comment: "${formatGQLString(ticketComment.comment)}"` : ''}
  `;
}

export function createTicket(ticket, grievanceConfig, clientMutationLabel) {
  const resolutionTimeMap = {};
  grievanceConfig.grievanceDefaultResolutionsByCategory.forEach((item) => {
    resolutionTimeMap[item.category] = item.resolutionTime;
  });
  // eslint-disable-next-line no-param-reassign
  ticket.resolution = resolutionTimeMap[ticket.category];
  const mutation = formatMutation('createTicket', formatTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_CREATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
  });
}

export function updateTicket(ticket, clientMutationLabel) {
  const mutation = formatMutation('updateTicket', formatUpdateTicketGQL(ticket), clientMutationLabel);
  const requestedDateTime = new Date();
  return graphql(mutation.payload, ['TICKET_MUTATION_REQ', 'TICKET_UPDATE_TICKET_RESP', 'TICKET_MUTATION_ERR'], {
    clientMutationId: mutation.clientMutationId,
    clientMutationLabel,
    requestedDateTime,
    id: ticket.id,
  });
}

// Upstream TicketGQLType fields only — custom data is in jsonExt
const TICKET_PROJECTION = [
  'id', 'title', 'code', 'description', 'status',
  'priority', 'dueDate', 'reporter', 'reporterId',
  'reporterType', 'reporterTypeName', 'reporterFirstName', 'reporterLastName', 'reporterDob',
  'category', 'flags', 'channel',
  'resolution', 'dateOfIncident', 'dateCreated',
  'attendingStaff {id, username}', 'version', 'isHistory', 'jsonExt',
];

export function fetchTicket(mm, filters) {
  const payload = formatPageQueryWithCount('tickets', filters, TICKET_PROJECTION);
  return graphql(payload, 'TICKET_TICKET');
}

export function fetchTicketSummaries(mm, filters) {
  const payload = formatPageQueryWithCount('tickets', filters, TICKET_PROJECTION);
  return graphql(payload, 'TICKET_TICKETS');
}

export function fetchTicketComments(ticket) {
  if (ticket && ticket.id) {
    const filters = [
      `ticket_Id: "${ticket.id}"`,
      'orderBy: ["-dateCreated"]',
    ];
    const projections = [
      'id',
      'commenter',
      'commenterId',
      'commenterType',
      'commenterTypeName',
      'comment',
      'isResolution',
      'dateCreated',
      'commenterFirstName',
      'commenterLastName',
      'commenterDob',
    ];
    const payload = formatPageQueryWithCount(
      'comments',
      filters,
      projections,
    );
    return graphql(payload, 'COMMENT_COMMENTS');
  }
  return { type: 'COMMENT_COMMENTS', payload: { data: [] } };
}

export function createTicketComment(ticketComment, ticket, commenterType, clientMutationLabel) {
  const mutation = formatMutation(
    'createComment',
    formatTicketCommentGQL(ticketComment, ticket, commenterType),
    clientMutationLabel,
  );
  const requestedDateTime = new Date();
  return graphql(
    mutation.payload,
    ['TICKET_ATTACHMENT_MUTATION_REQ', 'TICKET_CREATE_TICKET_ATTACHMENT_RESP', 'TICKET_ATTACHMENT_MUTATION_ERR'],
    {
      clientMutationId: mutation.clientMutationId,
      clientMutationLabel,
      requestedDateTime,
    },
  );
}
