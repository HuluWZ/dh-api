import { Prisma } from '@prisma/client';

export const setPinnedAtOnChatUpdateMiddleware: Prisma.Middleware = async (
  params,
  next,
) => {
  const { model, action, args } = params;
  if (
    ['PrivateMessage', 'GroupMessage'].includes(model) &&
    ['update', 'updateMany'].includes(action)
  ) {
    const { data } = args;
    if (data.is_pinned === true) {
      data.pinnedAt = new Date().toISOString();
    } else if (data.is_pinned === false) {
      data.pinnedAt = null;
    }
  }
  return next(params);
};
