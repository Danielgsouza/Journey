import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { env } from "../env";

export const confirmParticipants = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/participants/:participantId/confirm",
    {
      schema: {
        params: z.object({
          participantId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { participantId } = request.params;

      const participant = await prisma.participant.findUnique({
        where: { id: participantId },
      });

      if (!participant) {
        return { error: "Participant not found" };
      }

      if (participant.is_confirmed) {
        return reply.redirect(
          `${env.WEB_BASE_URL}/trips/${participant.trip_id}`
        );
      }

      await prisma.participant.update({
        where: { id: participantId },
        data: { is_confirmed: true },
      });

      return reply.redirect(`${env.WEB_BASE_URL}/trips/${participant.trip_id}`);
    }
  );
};
