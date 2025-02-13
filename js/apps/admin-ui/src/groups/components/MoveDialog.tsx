import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "react-i18next";

import { adminClient } from "../../admin-client";
import { useAlerts } from "../../components/alert/Alerts";
import { GroupPickerDialog } from "../../components/group/GroupPickerDialog";

type MoveDialogProps = {
  source: GroupRepresentation;
  onClose: () => void;
  refresh: () => void;
};

const moveToRoot = (source: GroupRepresentation) =>
  source.id
    ? adminClient.groups.updateRoot(source)
    : adminClient.groups.create(source);

const moveToGroup = async (
  source: GroupRepresentation,
  dest: GroupRepresentation,
) => adminClient.groups.updateChildGroup({ id: dest.id! }, source);

export const MoveDialog = ({ source, onClose, refresh }: MoveDialogProps) => {
  const { t } = useTranslation();
  const { addAlert, addError } = useAlerts();

  const moveGroup = async (group?: GroupRepresentation[]) => {
    try {
      await (group ? moveToGroup(source, group[0]) : moveToRoot(source));
      refresh();
      addAlert(t("moveGroupSuccess"));
    } catch (error) {
      addError("groups:moveGroupError", error);
    }
  };

  return (
    <GroupPickerDialog
      type="selectOne"
      filterGroups={[source]}
      text={{
        title: "groups:moveToGroup",
        ok: "groups:moveHere",
      }}
      onClose={onClose}
      onConfirm={moveGroup}
    />
  );
};
