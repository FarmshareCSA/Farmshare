import { Signer } from "ethers";
import { EAS, SchemaRegistry } from "../../typechain-types";
import { NO_EXPIRATION, ZERO_BYTES32 } from "../../utils/Constants";
import { getUIDFromAttestTx } from "../../utils/EAS";
import { expect } from "chai";

export interface AttestationRequestData {
  recipient: string;
  expirationTime: bigint;
  revocable?: boolean;
  refUID?: string;
  data?: any;
  value?: bigint;
}

export interface AttestationOptions {
  from: Signer;
  deadline?: bigint;
  value?: bigint;
  bump?: number;
  skipBalanceCheck?: boolean;
}

export const expectAttestation = async (
  eas: EAS,
  schema: string,
  request: AttestationRequestData,
  options: AttestationOptions,
) => {
  const {
    recipient,
    expirationTime,
    revocable = true,
    refUID = ZERO_BYTES32,
    data = ZERO_BYTES32,
    value = 0n,
  } = request;
  const { from: txSender, deadline = NO_EXPIRATION } = options;
  const msgValue = options.value ?? value;
  const args = [
    { schema, data: { recipient, expirationTime, revocable, refUID, data, value } },
    { value: msgValue },
  ] as const;
  const res = await eas.connect(txSender).attest(...args);
  const uid = await getUIDFromAttestTx(res);
  await expect(res)
    .to.emit(eas, "Attested")
    .withArgs(recipient, await txSender.getAddress(), uid, schema);

  expect(await eas.isAttestationValid(uid)).to.be.true;
  const attestation = await eas.getAttestation(uid);
  expect(attestation.uid).to.equal(uid);

  return { uid, res };
};
