export interface Legend {
  name: string;
  reference: string;
  banned: boolean;
}

export interface BanCommand {
  type: "command";
  cmd: {
    withAck: boolean;
    customMatch_SetLegendBan?: {
      legendRefs: string;
    };
    customMatch_GetLegendBanStatus?: {};
  };
}

export interface BanResponse {
  type: "cmd_res";
  body: {
    success?: boolean;
    legends?: Legend[];
  };
}