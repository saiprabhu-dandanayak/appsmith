import widgetLocators from "../../../../../locators/Widgets.json";
import {
  agHelper,
  deployMode,
  draggableWidgets,
  entityExplorer,
  locators,
  propPane,
  table,
} from "../../../../../support/Objects/ObjectsCore";
import EditorNavigation, {
  EntityType,
} from "../../../../../support/Pages/EditorNavigation";

describe(
  "Camera widget - Video test",
  { tags: ["@tag.Widget", "@tag.Camera", "@tag.Visual", "@tag.Binding"] },
  () => {
    before(() => {
      //Reset video source to default incase it got changed in other specs
      cy.task("resetVideoSource");
    });

    it("1. Verify Visible property of video mode in camera widget", () => {
      entityExplorer.DragDropWidgetNVerify(draggableWidgets.CAMERA);
      agHelper.AssertAttribute(
        propPane._mode("Image"),
        "data-selected",
        "true",
      );
      agHelper.GetNClick(propPane._mode("Video"), 1, true);
      agHelper.AssertElementAbsence(widgetLocators.cameraErrorText);

      agHelper.AssertExistingToggleState("Visible", "true");
      propPane.EnterJSContext("Visible", "{{(55>45)?false:true}}", true, true);
      deployMode.DeployApp();
      agHelper.AssertElementAbsence(
        locators._widgetInDeployed(draggableWidgets.CAMERA),
      );
      deployMode.NavigateBacktoEditor();
      EditorNavigation.SelectEntityByName("Camera1", EntityType.Widget);
      propPane.EnterJSContext("Visible", "", false);
      propPane.ToggleJSMode("Visible", false);
      propPane.TogglePropertyState("Visible", "On");
      agHelper.AssertElementVisibility(
        locators._widgetInCanvas(draggableWidgets.CAMERA),
      );
    });

    it("2. Verify Disabled property of video mode in camera widget", () => {
      agHelper.AssertExistingToggleState("Disabled", "false");
      propPane.EnterJSContext("Disabled", "{{(45>55)?false:true}}", true, true);
      deployMode.DeployApp();
      agHelper
        .GetElement(widgetLocators.cameraWidgetScreen)
        .should("have.attr", "disabled");
      deployMode.NavigateBacktoEditor();
      EditorNavigation.SelectEntityByName("Camera1", EntityType.Widget);
      propPane.EnterJSContext("Disabled", "", false);
      propPane.ToggleJSMode("Disabled", false);
      propPane.TogglePropertyState("Disabled", "Off");
      agHelper
        .GetElement(widgetLocators.cameraWidgetScreen)
        .should("not.have.attr", "disabled");
    });

    it("3. Verify Mirrored property of video mode in camera widget", () => {
      agHelper.AssertExistingToggleState("Mirrored", "true");
      propPane.EnterJSContext("Mirrored", "{{(55>45)?false:true}}", true, true);
      deployMode.DeployApp(locators._widgetInDeployed(draggableWidgets.CAMERA));
      deployMode.NavigateBacktoEditor();
      EditorNavigation.SelectEntityByName("Camera1", EntityType.Widget);
      propPane.EnterJSContext("Mirrored", "", false);
      propPane.ToggleJSMode("Mirrored", false);
      propPane.TogglePropertyState("Mirrored", "On");
    });

    it("4. Verify OnVideoSave event of video mode in camera widget", () => {
      propPane.EnterJSContext(
        "onVideoSave",
        "{{showAlert('Video Captured successfully!','success')}}",
        true,
      );
      propPane.ToggleJSMode("onVideoSave", false);

      propPane.SelectPlatformFunction("onVideoSave", "Download");
      agHelper.TypeText(
        propPane._actionSelectorFieldByLabel("Data to download"),
        "{{Camera1.videoBlobURL}}",
      );
      agHelper.TypeText(
        propPane._actionSelectorFieldByLabel("File name with extension"),
        "video.mp4",
      );
    });

    it("5. Test video capture , preview, save, refresh, download & icons in each stage", () => {
      deployMode.DeployApp(locators._widgetInDeployed(draggableWidgets.CAMERA));

      //Validate camera screen & icons
      agHelper.AssertElementVisibility(widgetLocators.cameraMicrophoneBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraMicrophoneDropdown);
      agHelper.AssertElementVisibility(widgetLocators.cameraVideoOnOffBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraVideoDropdown);

      //Start video recording
      agHelper.GetNClick(widgetLocators.cameraCaptureBtn);
      agHelper.Sleep(2000);

      //Stop recording
      agHelper.GetNClick(widgetLocators.cameraStopRecordingBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraSaveBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraVideodiscardBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraVideoPlayBtn);

      //Save video
      agHelper.GetNClick(widgetLocators.cameraSaveBtn);

      //Validate video in refresh screen
      agHelper.AssertElementVisibility(widgetLocators.cameraRefreshBtn);

      //Refresh video
      agHelper.GetNClick(widgetLocators.cameraRefreshBtn);
      agHelper.AssertElementVisibility(widgetLocators.cameraCaptureBtn);
      agHelper.ValidateToastMessage("Captured successfully!");

      //Validate video download OnVideoSave event
      table.ValidateDownloadNVerify("video.mp4");
    });

    it("6. Capture multiple videos & check it does not overwrite previous captures", () => {
      deployMode.NavigateBacktoEditor();
      EditorNavigation.SelectEntityByName("Camera1", EntityType.Widget);
      propPane.SelectPlatformFunction("onVideoSave", "Download");
      agHelper.TypeText(
        propPane._actionSelectorFieldByLabel("Data to download"),
        "{{Camera1.imageBlobURL}}",
      );
      agHelper.TypeText(
        propPane._actionSelectorFieldByLabel("File name with extension"),
        "video1.mp4",
      );
      deployMode.DeployApp(locators._widgetInDeployed(draggableWidgets.CAMERA));
      agHelper.GetNClick(widgetLocators.cameraCaptureBtn);
      agHelper.Sleep(3000);
      agHelper.GetNClick(widgetLocators.cameraStopRecordingBtn);
      agHelper.GetNClick(widgetLocators.cameraSaveBtn);
      agHelper.ValidateToastMessage("Captured successfully!");
      table.ValidateDownloadNVerify("video1.mp4");
      table.ValidateDownloadNVerify("video.mp4");
    });
  },
);
