import { prosesTriggerMockGateway } from "@/controllers/MockGatewayController";
import { toResponse } from "@/lib/errors";
import { bacaJson } from "@/lib/http";

export async function POST(req: Request) {
  try {
    return Response.json(await prosesTriggerMockGateway(await bacaJson(req)));
  } catch (error) {
    return toResponse(error);
  }
}
