import { gql, useMutation, useQuery } from "@apollo/client";

import { useState } from "react";
import { useRouter } from "next/router";
import { CharacterSnapshot } from "../../../../../__generated__/resolvers-types";
import StyledCard from "../../../../../components/styled-card";
import EquipmentDisplay from "../../../../../components/equipment-display";
import SecondaryEquipmentDisplay from "../../../../../components/secondary-equipment-display";
import StyledButton from "../../../../../components/styled-button";
import CharacterStatsDisplay from "../../../../../components/character-stats-display";
import SkillTree from "../../../../../components/skill-tree/skill-tree";

export default function Character() {
  const router = useRouter();
  const { userId, characterId, snapshotId } = router.query;

  const [characterSnapshots, setCharacterSnapshots] = useState<
    CharacterSnapshot[]
  >([]);
  const [currentSnapshot, setCurrentSnapshot] =
    useState<CharacterSnapshot | null>(null);

  const { refetch: refetchSnapshots } = useQuery(
    gql`
      query CharacterSnapshots($characterId: String!) {
        characterSnapshots(characterId: $characterId) {
          id
          characterId
          timestamp
          characterClass
          league
          experience
          level
          current
        }
      }
    `,
    {
      skip: !characterId,
      variables: { characterId: characterId },
      onCompleted(data) {
        setCharacterSnapshots(data.characterSnapshots);
        if (data.characterSnapshots.length > 0) {
          router.push({
            query: {
              userId: userId,
              characterId: characterId,
              snapshotId: data.characterSnapshots[0].id,
            },
          });
        }
      },
    }
  );

  useQuery(
    gql`
      query CharacterSnapshot($snapshotId: String!, $characterId: String!) {
        characterSnapshot(snapshotId: $snapshotId, characterId: $characterId) {
          id
          characterId
          timestamp
          characterClass
          league
          experience
          level
          current
          characterPassivesSnapshot {
            snapshotId
            banditChoice
            pantheonMajor
            pantheonMinor
            hashes
            hashesEx
            jewelData
            masteryEffects
          }
          characterSnapshotItems {
            id
            snapshotId
            inventoryId
            socketedInId
            baseType
            typeLine
            name
            ilvl
            explicitMods
            utilityMods
            properties
            requirements
            sockets
            frameType
            flavourText
            description
            icon
            w
            h
            corrupted
            support
            socket
            gemColor
            itemGroupHashString
          }
          poeCharacter {
            id
            userId
            name
            createdAtTimestamp
            lastSnapshotTimestamp
          }
          characterSnapshotPobStats {
            snapshotId
            accuracy
            armour
            blockChance
            spellBlockChance
            chaosResist
            coldResist
            dex
            energyShield
            fireResist
            int
            life
            lightningResist
            mana
            str
            evasion
            pobCode
          }
        }
      }
    `,
    {
      skip: !characterId || !snapshotId,
      variables: { characterId: characterId, snapshotId: snapshotId },
      onCompleted(data) {
        setCurrentSnapshot(data.characterSnapshot);
      },
    }
  );

  const [passiveTreeData, setPassiveTreeData] = useState<any | null>(null);
  useQuery(
    gql`
      query Query($league: String!) {
        passiveTree(league: $league)
      }
    `,
    {
      variables: { league: "3.20" },
      onCompleted(data) {
        setPassiveTreeData(data.passiveTree);
      },
    }
  );

  const [takeSnapshot] = useMutation(
    gql`
      mutation TakeCharacterSnapshot($characterId: String!) {
        takeCharacterSnapshot(characterId: $characterId)
      }
    `,
    {
      variables: { characterId: characterId },
      onCompleted(data, clientOptions) {
        refetchSnapshots();
      },
    }
  );

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-row space-x-2">
          <StyledCard title="Character">
            <div>
              <div>{currentSnapshot?.league}</div>
              <div>{currentSnapshot?.poeCharacter?.name}</div>
              <div>
                Level {currentSnapshot?.level} {currentSnapshot?.characterClass}
              </div>
            </div>
          </StyledCard>
          <StyledCard title="Snapshots">
            {characterSnapshots.map((snapshot, i) => (
              <>
                <div key={i}>
                  {snapshot.timestamp}: {snapshot.experience}
                </div>
              </>
            ))}
            <StyledButton
              text={"Take Snapshot"}
              onClick={() => {
                takeSnapshot();
              }}
            />
          </StyledCard>
        </div>

        <div className="flex flex-row space-x-2">
          <StyledCard title="Equipment">
            <EquipmentDisplay
              items={currentSnapshot?.characterSnapshotItems!}
            />
          </StyledCard>
          <StyledCard title="Other Items">
            <SecondaryEquipmentDisplay
              items={currentSnapshot?.characterSnapshotItems!}
            />
          </StyledCard>
        </div>
        <div className="flex flex-row space-x-2">
          <div className="grow">
            <StyledCard title={"Pob Stats"}>
              <CharacterStatsDisplay
                pobStats={currentSnapshot?.characterSnapshotPobStats}
              />
            </StyledCard>
          </div>
          <StyledCard title={"Info"}>
            <div>
              <div>
                Bandit:{" "}
                {currentSnapshot?.characterPassivesSnapshot?.banditChoice}
              </div>
              <div>
                Pantheon Major:{" "}
                {currentSnapshot?.characterPassivesSnapshot?.pantheonMajor}
              </div>
              <div>
                Pantheon Minor:{" "}
                {currentSnapshot?.characterPassivesSnapshot?.pantheonMinor}
              </div>
            </div>
          </StyledCard>
        </div>

        <StyledCard title={"Passive Tree"}>
          {passiveTreeData && (
            <SkillTree
              data={passiveTreeData}
              selectedNodes={
                new Set(
                  currentSnapshot?.characterPassivesSnapshot?.hashes.map((h) =>
                    h.toString()
                  ) ?? []
                )
              }
            />
          )}
        </StyledCard>
      </div>
    </>
  );
}
