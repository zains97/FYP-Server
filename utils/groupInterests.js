exports.groupInterests = (interests) => {
  //1
  //IF SPORTS THEN ADD
  if (interests.includes("Sports")) {
    //Add football
    if (!interests.includes("Football")) {
      interests.push("Football");
    }
    //Add cricket
    if (!interests.includes("Cricket")) {
      interests.push("Cricket");
    }

    if (!interests.includes("Martial Arts")) {
      interests.push("Martial Arts");
    }
  }
  //2
  if (interests.includes("Philosophy")) {
    if (!interests.includes("Religion")) {
      interests.push("Religion");
    }
  }

  //3
  //IF RELIGION THEN
  if (interests.includes("Religion")) {
    //Add islam
    if (!interests.includes("Islam")) {
      interests.push("Islam");
    }
    //Add Christianity
    if (!interests.includes("Christianity")) {
      interests.push("Christianity");
    }
  }
  //4
  if (interests.includes("Health")) {
    if (!interests.includes("Fitness")) {
      interests.push("Fitness");
    }
  }
  //5
  if (interests.includes("Tech")) {
    if (!interests.includes("Programming")) {
      interests.push("Programming");
    }
  }
  //6
  if (interests.includes("Science")) {
    if (!interests.includes("Tech")) {
      interests.push("Tech");
    }
  }

  return interests;
};
