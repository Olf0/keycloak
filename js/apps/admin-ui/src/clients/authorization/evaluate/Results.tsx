import {
  Button,
  ButtonVariant,
  Divider,
  Form,
  InputGroup,
  PageSection,
  Select,
  SelectOption,
  SelectVariant,
  TextInput,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { TableComposable, Th, Thead, Tr } from "@patternfly/react-table";
import { KeyboardEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import type PolicyEvaluationResponse from "@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse";
import { FixedButtonsGroup } from "../../../components/form/FixedButtonGroup";
import { ListEmptyState } from "../../../components/list-empty-state/ListEmptyState";
import useToggle from "../../../utils/useToggle";
import { AuthorizationDataModal } from "../AuthorizationDataModal";
import { AuthorizationEvaluateResource } from "../AuthorizationEvaluateResource";

type ResultProps = {
  evaluateResult: PolicyEvaluationResponse;
  refresh: () => void;
  back: () => void;
};

enum ResultsFilter {
  All = "ALL",
  StatusDenied = "STATUS_DENIED",
  StatusPermitted = "STATUS_PERMITTED",
}

function filterResults(
  results: EvaluationResultRepresentation[],
  filter: ResultsFilter,
) {
  switch (filter) {
    case ResultsFilter.StatusPermitted:
      return results.filter(({ status }) => status === "PERMIT");
    case ResultsFilter.StatusDenied:
      return results.filter(({ status }) => status === "DENY");
    default:
      return results;
  }
}

export const Results = ({ evaluateResult, refresh, back }: ResultProps) => {
  const { t } = useTranslation();

  const [filterDropdownOpen, toggleFilterDropdown] = useToggle();

  const [filter, setFilter] = useState(ResultsFilter.All);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const confirmSearchQuery = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      confirmSearchQuery();
    }
  };

  const filteredResources = useMemo(
    () =>
      filterResults(evaluateResult.results!, filter).filter(
        ({ resource }) => resource?.name?.includes(searchQuery) ?? false,
      ),
    [evaluateResult.results, filter, searchQuery],
  );

  const noEvaluatedData = evaluateResult.results!.length === 0;
  const noFilteredData = filteredResources.length === 0;

  return (
    <PageSection>
      <Toolbar>
        <ToolbarGroup className="providers-toolbar">
          <ToolbarItem>
            <InputGroup>
              <TextInput
                name={"inputGroupName"}
                id={"inputGroupName"}
                type="search"
                aria-label={t("common:search")}
                placeholder={t("common:search")}
                onChange={setSearchInput}
                onKeyDown={handleKeyDown}
              />
              <Button
                variant={ButtonVariant.control}
                aria-label={t("common:search")}
                onClick={() => confirmSearchQuery()}
              >
                <SearchIcon />
              </Button>
            </InputGroup>
          </ToolbarItem>
          <ToolbarItem>
            <Select
              width={300}
              data-testid="filter-type-select"
              isOpen={filterDropdownOpen}
              className="kc-filter-type-select"
              variant={SelectVariant.single}
              onToggle={toggleFilterDropdown}
              onSelect={(_, value) => {
                setFilter(value as ResultsFilter);
                toggleFilterDropdown();
                refresh();
              }}
              selections={filter}
            >
              <SelectOption
                data-testid="all-results-option"
                value={ResultsFilter.All}
                isPlaceholder
              >
                {t("allResults")}
              </SelectOption>
              <SelectOption
                data-testid="result-permit-option"
                value={ResultsFilter.StatusPermitted}
              >
                {t("resultPermit")}
              </SelectOption>
              <SelectOption
                data-testid="result-deny-option"
                value={ResultsFilter.StatusDenied}
              >
                {t("resultDeny")}
              </SelectOption>
            </Select>
          </ToolbarItem>
        </ToolbarGroup>
      </Toolbar>
      {!noFilteredData && (
        <TableComposable aria-label={t("evaluationResults")}>
          <Thead>
            <Tr>
              <Th aria-hidden="true" />
              <Th>{t("resource")}</Th>
              <Th>{t("overallResults")}</Th>
              <Th>{t("scopes")}</Th>
              <Th aria-hidden="true" />
            </Tr>
          </Thead>
          {filteredResources.map((resource, rowIndex) => (
            <AuthorizationEvaluateResource
              key={rowIndex}
              rowIndex={rowIndex}
              resource={resource}
              evaluateResults={evaluateResult.results}
            />
          ))}
        </TableComposable>
      )}
      {(noFilteredData || noEvaluatedData) && (
        <>
          <Divider />
          <ListEmptyState
            isSearchVariant
            message={t("common:noSearchResults")}
            instructions={t("common:noSearchResultsInstructions")}
          />
        </>
      )}
      <Form>
        <FixedButtonsGroup name="authorization">
          <Button data-testid="authorization-eval" id="back-btn" onClick={back}>
            {t("common:back")}
          </Button>{" "}
          <Button
            data-testid="authorization-reevaluate"
            id="reevaluate-btn"
            variant="secondary"
            onClick={refresh}
          >
            {t("clients:reevaluate")}
          </Button>{" "}
          <AuthorizationDataModal data={evaluateResult.rpt!} />
        </FixedButtonsGroup>
      </Form>
    </PageSection>
  );
};
