---
mode: agent
---

Quest info can be found in DbTable 0. The tables should include all the information needed to create a well-made quest stub page.

### Step 1: Understand the quest DBTable and create the Quest type to represent it

The quest dbtable has the following columns:

```
0:0    quest:id
0:1    quest:sortname
0:2    quest:displayname
0:3    quest:in_prerelease
0:4    quest:type
0:5    quest:members
0:6    quest:difficulty
0:7    quest:length
0:8    quest:location
0:9    quest:releasedate
0:10    quest:series
0:11    quest:seriesno
0:12    quest:seriesno_override
0:13    quest:startcoord
0:14    quest:startnpc
0:15    quest:startloc
0:16    quest:mapelement
0:17    quest:questpoints
0:18    quest:unstartedstate
0:19    quest:endstate
0:20    quest:version
0:21    quest:parent_quest
0:22    quest:has_subquests
0:23    quest:requirement_stats
0:24    quest:recommended_stats
0:25    quest:requirement_quests
0:26    quest:requirement_questpoints
0:27    quest:requirement_combat
0:28    quest:recommended_combat
0:29    quest:requirement_check_skills_on_start
0:30    quest:requirements_boostable
0:31    quest:speedrun
0:32    quest:total_xp_awarded
0:33    quest:prerequisite_direct
0:34    quest:prerequisite_indirect
0:35    quest:cr_can_recommend
0:36    quest:cr_experience_profile
0:37    quest:cr_recommendation_reason
0:38    quest:cr_recommendation_reason_is_primary
0:39    quest:cr_points_skill
0:40    quest:cr_points_transport
0:41    quest:cr_points_equipment
0:42    quest:cr_points_area
0:43    quest:cr_points_xp_type
0:44    quest:cr_starter
0:45    quest:fsw_world_first_id
```

First, make a `Quest` type in `src/types/quest.ts`. Create a field for each column in the quest dbtable, but use camelCase for the field names. For example, `quest:total_xp_awarded` becomes `totalXpAwarded`.

### Step 2: Create the quest infobox template, "Infobox Quest"

- Create a new file `src/mediawiki/templates/InfoboxQuest/`. This template should take a `quest` prop of type `Quest`. The infbox quest parameters can be found here: https://oldschool.runescape.wiki/w/Template:Infobox%20Quest#Parameters
- The infobox should include all the parameters that are relevant to quests. Use the `quest` prop to fill in the values for these parameters. If a parameter is not applicable or not available, it can be omitted.
- Be sure to include tests for the infobox in `src/mediawiki/templates/InfoboxQuest.test.ts`.
- Any utility functions needed for the infobox should be created in `src/mediawiki/templates/InfoboxQuest.utils.ts` and should have tests in `src/mediawiki/templates/InfoboxQuest.utils.test.ts`.

Here is an example of how the infobox quest template should look:

```
{{Infobox Quest
|name = The Curse of Arrav
|number = 170
|image = [[File:The Curse of Arrav.png|300px]]
|release = [[6 November]] [[2024]]
|update = The Curse of Arrav & Mobile Anniversary Update
|members = Yes
|series = [[Quests/Series#Mahjarrat|Mahjarrat]], #10
|developer =
}}
```

### Step 3: Create the "SCP" template

- Create a new file `src/mediawiki/templates/SCP/`.
- The SCP parameters can be found here: https://oldschool.runescape.wiki/w/Template:SCP#Parameters
- The parameters should be put into an `SCPProps` type in `src/mediawiki/templates/SCP/SCP.types.ts`.
  - An additional type should be included for the skill param.
  - A list of skill names can be found here: https://oldschool.runescape.wiki/w/Skills#Skills
  - Additional, non-skill, values for the "skill" param can be found here: https://oldschool.runescape.wiki/w/Template:SCP#Non-skill_clickpics
- The SCP template should take a `props` prop of type `SCPProps`. Use the `props` prop to fill in the values for these parameters. If a parameter is not applicable or not available, it can be omitted.
- Be sure to include tests for the SCP template in `src/mediawiki/templates/SCP.test.ts`.

Here is an example of how the SCP template should look:

```
{{SCP|Agility|61|link=yes}}
```

### Step 4: Create the "Quest details" template

- Create a new file `src/mediawiki/templates/QuestDetails/`. This template should take a `quest` prop of type `Quest`. The quest details parameters can be found here: https://oldschool.runescape.wiki/w/Template:Quest%20details
- The quest details template should include all the parameters that are relevant to quests. Use the `quest` prop to fill in the values for these parameters. If a parameter is not applicable or not available, it can be omitted.
- Be sure to include tests for the quest details template in `src/mediawiki/templates/QuestDetails.test.ts`.
- Any utility functions needed for the quest details template should be created in `src/mediawiki/templates/QuestDetails.utils.ts` and should have tests in `src/mediawiki/templates/QuestDetails.utils.test.ts`.
- The quest details template will need to create new types in `src/types/quest.ts`:
  - `QuestDifficulty` type to represent the quest difficulty parameters. Must be one of the following: Novice, Intermediate, Experienced, Master, Grandmaster, Special.
  - `QuestLength` type to represent the quest length parameters. Must be one of the following: Very Short, Short, Medium, Long, Very Long.
  - `QuestType` type to represent the quest type parameters. Must be one of the following: Quests or Miniquests.
- For map related types, create the following types in `src/types/map.ts`:
  - `WorldPoint` type to represent the map location parameters. It should have the following fields: `x`, `y`, `plane`.

Here is an example of how the `Quest details` template should look:

```
{{Quest details
|start = Speak to [[Elias White]] at the [[Uzer Oasis]].
|startmap = 3505,3038
|difficulty = Master
|description = The icy waste to the north of the troll country is as mysterious as any land in Gielinor, no less because of the interest the Mahjarrat take in it. Elias White thinks that he might have found a way for you to discover more about this strange area to the north. Uncover more of the mysteries of the Mahjarrat and learn about the dark magic that was used to enslave Arrav for these last few millennia.
|length = Medium
|requirements = * {{SCP|Mining|64|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Ranged|62|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Thieving|62|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Agility|61|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Strength|58|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Slayer|37|link=yes}}{{Boostable|}}{{Questreqstart|}}
*Completion of the following quests:
** [[Defender of Varrock]]
*** [[Shield of Arrav]]
*** [[Temple of Ikov]]
*** [[Below Ice Mountain]]
*** [[Family Crest]]
*** [[Garden of Tranquillity]]
**** [[Creature of Fenkenstrain]]
***** [[Priest in Peril]]
***** [[The Restless Ghost]]
*** [[What Lies Below]]
**** [[Rune Mysteries]]
*** [[Romeo & Juliet]]
*** [[Demon Slayer]]
** [[Troll Romance]]
*** [[Troll Stronghold]]
**** [[Death Plateau]]
|items = *3 [[dwellberries]]
*[[Ring of life]]
*Any [[pickaxe]]
*Any [[Crossbow (weapon)|crossbow]]
*[[Mith grapple]]
*[[Insulated boots]]
|recommended = *{{SCP|Combat|85|link=yes}}
|kills = * [[Golem guard]] ''(level 141)''
* [[Arrav]] ''(level 339)''
}}
```

### Step 5: Create the "Quest rewards" template

- Create a new file `src/mediawiki/templates/QuestRewards/`. This template should take a `quest` prop of type `Quest`. The quest rewards parameters can be found here: https://oldschool.runescape.wiki/w/Template:Quest_rewards
- The quest rewards template should include all the parameters that are relevant to quests. Use the `quest` prop to fill in the values for these parameters. If a parameter is not applicable or not available, it can be omitted.
- Be sure to include tests for the quest rewards template in `src/mediawiki/templates/QuestRewards/QuestRewards.test.ts`.
- The quest rewards template should use the SCP template for skill rewards.

Here is an example of how the `Quest rewards` template should look:

```
{{Quest rewards
|name = The Curse of Arrav
|image = [[File:The Curse of Arrav rewards scroll.png]]
|qp = 2
|rewards =
* {{SCP|Mining|40,000|link=yes}} [[experience]]
* {{SCP|Thieving|40,000|link=yes}} [[experience]]
* {{SCP|Agility|40,000|link=yes}} [[experience]]
* Access to [[Zemouregal's Fort]].
}}
```

### Step 5: Create the quest stub page

Finally, create the quest stub page in `src/mediawiki/pages/quest/`.

- This page should use the `InfoboxQuest`, `SCP`, and `QuestDetails` templates to display the quest information.
- The page should also include a brief introduction to the quest, using the `displayName` and `description` fields from the `Quest` type.

Here io an example of how the full quest stub page should look:

```
{{Infobox Quest
|name = The Curse of Arrav
|number = 170
|image = [[File:The Curse of Arrav.png|300px]]
|release = [[6 November]] [[2024]]
|update = The Curse of Arrav & Mobile Anniversary Update
|members = Yes
|series = [[Quests/Series#Mahjarrat|Mahjarrat]], #10
|developer =
}}
'''The Curse of Arrav''' is a quest announced at the [[Summer Summit 2024]] and released on 6 November 2024. It is a remake of the ''RuneScape'' {{RSL|The Curse of Arrav|quest of the same name}}, with changes made to match the lore and style of ''Old School RuneScape''.

{{Quest details
|start = Speak to [[Elias White]] at the [[Uzer Oasis]].
|startmap = 3505,3038
|difficulty = Master
|description = The icy waste to the north of the troll country is as mysterious as any land in Gielinor, no less because of the interest the Mahjarrat take in it. Elias White thinks that he might have found a way for you to discover more about this strange area to the north. Uncover more of the mysteries of the Mahjarrat and learn about the dark magic that was used to enslave Arrav for these last few millennia.
|length = Medium
|requirements = * {{SCP|Mining|64|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Ranged|62|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Thieving|62|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Agility|61|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Strength|58|link=yes}}{{Boostable|no}}{{Questreqstart|}}
* {{SCP|Slayer|37|link=yes}}{{Boostable|}}{{Questreqstart|}}
*Completion of the following quests:
** [[Defender of Varrock]]
*** [[Shield of Arrav]]
*** [[Temple of Ikov]]
*** [[Below Ice Mountain]]
*** [[Family Crest]]
*** [[Garden of Tranquillity]]
**** [[Creature of Fenkenstrain]]
***** [[Priest in Peril]]
***** [[The Restless Ghost]]
*** [[What Lies Below]]
**** [[Rune Mysteries]]
*** [[Romeo & Juliet]]
*** [[Demon Slayer]]
** [[Troll Romance]]
*** [[Troll Stronghold]]
**** [[Death Plateau]]
|items = *3 [[dwellberries]]
*[[Ring of life]]
*Any [[pickaxe]]
*Any [[Crossbow (weapon)|crossbow]]
*[[Mith grapple]]
*[[Insulated boots]]
|recommended = *{{SCP|Combat|85|link=yes}}
|kills = * [[Golem guard]] ''(level 141)''
* [[Arrav]] ''(level 339)''
}}

==Walkthrough==

==Rewards==
{{Quest rewards
|name = The Curse of Arrav
|image = [[File:The Curse of Arrav rewards scroll.png]]
|qp = 2
|rewards =
* {{SCP|Mining|40,000|link=yes}} [[experience]]
* {{SCP|Thieving|40,000|link=yes}} [[experience]]
* {{SCP|Agility|40,000|link=yes}} [[experience]]
* Access to [[Zemouregal's Fort]].
}}

==Transcript==
{{Hastranscript|quest}}

{{The Curse of Arrav}}
```

### Step 6: Create the quest page generation script

Create a new task for generating quest pages in the pages task file `src/tasks/pages.ts`. Model this after the existing page generation tasks.

The task should pull the quest data from the DBTable 0 and generate a page for each quest. It should use the `Quest` type to create the page content, using the templates created in the previous steps.

Additionally, it will need to pull `NPC` and `Item` from the cache for dbcolumns that use those types. For example, `quest:startnpc` should pull the NPC from the cache and use its `name` in the quest details template. As another example, `quest:requirement_quests` should pull the quests from the DBTable and use their name column in the quest details template.

### Step 7: Add a difference listener for quest pages

Add a difference listener in `src/tasks/differences/listeners/types/quest.ts` to handle quest pages. It should rely on `IndexType.Configs`, `ConfigType.DbRows`. If the new DBRow's table field is 0 it should make a quest page.

### Additional Notes

- Ensure all new additions have tests.
- Follow the existing code style and conventions in the project. Check the existing templates for examples of how to structure the code.
- The templates should be reusable and modular, allowing for easy updates in the future.
- If you think any templates are missing or could be improved, feel free to suggest them.
